const BrowserService = require('./BrowserService');
const path = require('path');
const fs = require('fs');
const Job = require('./../models/Job')
const Moment = require('moment');
const fetch = require('node-fetch');
const postmark = require("postmark");
const { getCSRFToken } = require('../utilities/getCSRFToken');
const { getHeaders } = require('../utilities/getHeaders');

let ResumesService = {};

ResumesService.getJobEmail = async(jobId) => {
    try {
        const headers = await getHeaders();

        //if job has email return it 
        let job = await Job.findOne({
            job_id: jobId,
        });

        if (!job || !job.jobDetails_emails || job.jobDetails_emails.length == 0) {
            let response = await fetch(`https://employers.indeed.com/j/jobs/view?id=${jobId}&indeedcsrftoken=${getCSRFToken()}`, {
                headers: {
                    ...headers,
                    "accept": "application/json",
                    "accept-language": "en-US,en;q=0.9",
                    "indeed-client-application": "ic-jobs-management",
                    "x-indeed-rpc": "1",

                },
                "body": null,
                "method": "GET"
            });
            if (response.status != 200) {
                throw Error('cant get job email');
            }
            let data = await response.json();
            job = data.job;
            return job.emails[0];
        } else {
            return job.jobDetails_emails[0];
        }

    } catch (error) {
        console.log("getJobEmail Error : ", error);
    }
};


ResumesService.getCandidatesDetails = async(jobId) => {

    //if job has candidates return it 
    let job = await Job.findOne({
        job_id: jobId,
    });
    if (!BrowserService.page) {
        await BrowserService.getNewBrowser();
        // throw Error('Chromuim browser not open, please open it first');
    }
    // else grab it from indeed
    let candidatesRetrieved = [];
    BrowserService.page.on('response', function getCandidatesFromJobPage(response) {
        if (response.url().includes('preview/candidates')) {
            response.json().then((res) => {
                if (res.candidates) {
                    let candidatesFromResponse = res.candidates
                    for (const currentCandidate of candidatesFromResponse) {
                        try {
                            let candidateId = currentCandidate.candidateId;
                            let resumeName = 'Resume' + currentCandidate.name.replace(' ', '');
                            candidatesRetrieved.push({
                                id: candidateId,
                                resumeName,
                                name: currentCandidate.name,
                            });
                        } catch (error) {
                            console.log(error.message);
                        }
                    }
                }
                BrowserService.page.removeListener('response', getCandidatesFromJobPage);
            })
        }
    });

    // go to 
    await BrowserService.page.evaluate(() => window.stop());
    await BrowserService.page.goto(`https://employers.indeed.com/c#candidates?id=${jobId}&sort=datedefault&order=desc&statusName=0`, { waitUntil: "load" });
    await BrowserService.page.waitForXPath(`//*[@id="employerAssistTooltipWrapper"]`);

    // check emails
    if (candidatesRetrieved || candidatesRetrieved.length) {
        //svae the new email
        job.candidates = candidatesRetrieved;
        await job.save();
        // return it
        return candidatesRetrieved;
    } else {
        return false;
    }

};

ResumesService.transferResumeOfOneCandidate = async(jobId, candidateId) => {
    if (!BrowserService.page) {
        await BrowserService.getNewBrowser();
    }

    //find the job
    let job = await Job.findOne({
        job_id: jobId,
    });

    //validate : job exists 
    if (!job) {
        throw Error('This Job Doesn\'t exist, please refresh the jobs page and try again');
    }

    //make sure job has an email 
    if (job.jobDetails_emails == null || job.jobDetails_emails.length == 0) {
        throw Error('This Job Doesn\'t have an Email yet, please click the get email button first');
    }

    //validate : job has candidate 
    let jobHasThisCandidatesId = job.candidates.filter(candidate => {
        return candidate.id == candidateId;
    })
    if (!jobHasThisCandidatesId) {
        throw Error('This Job Doesn\'t have this candidate, please refresh the jobs page and try again');
    }

    // delete old folder 
    await ResumesService.deleteCandidateFolder(jobId, candidateId);

    // download candidates resume
    await ResumesService.downloadResumesForOneCandidate(jobId, candidateId);

    // transfer via email 
    // await ResumesService.sendEmail(jobId, candidateId, "anaskasmi98@gmail.com");
    await ResumesService.sendEmail(jobId, candidateId, job.jobDetails_emails[0]);

    //mark the date of the last transfer 
    await Job.updateOne({
        job_id: jobId,
    }, {
        $set: {
            "candidates.$[f].lasteTransferDate": Moment().format('DD MMMM YYYY hh:mm:ss'),
        }
    }, {
        arrayFilters: [{
            "f.id": candidateId
        }, ],
    });
    // delete the resume folder 
    await ResumesService.deleteCandidateFolder(jobId, candidateId);
}


ResumesService.transferResumesOfCandidatesList = async(candidatesList) => {
    if (!BrowserService.page) {
        await BrowserService.getNewBrowser();
        // throw Error('Chromuim browser not open, please open it first');
    }
    for (const candidate of candidatesList) {
        try {
            //find the email
            let jobEmail = await ResumesService.getJobEmail(candidate.jobId);
            if (!jobEmail) {
                console.log(`This Job has no email : ${candidate.jobTitle}`);
                continue;
            }
            // delete old folder 
            await ResumesService.deleteCandidateFolder(candidate.jobId, candidate.candidateId);

            // download candidates resume
            await ResumesService.downloadResumesForOneCandidate(candidate.jobId, candidate.candidateId);

            // transfer via email 
            // await ResumesService.sendEmail(candidate.jobId, candidate.candidateId, "anaskasmi98@gmail.com");
            await ResumesService.sendEmail(candidate.jobId, candidate.candidateId, jobEmail);

            // delete the resume folder 
            await ResumesService.deleteCandidateFolder(candidate.jobId, candidate.candidateId);
        } catch (error) {
            // print candidate.candidateId
            console.log('--------------------------------');
            console.log({ error });
            console.log({ candidate });
            console.log("an error happened for one candidate, skipping it... ");
            console.log('--------------------------------');
        }
    }
}
ResumesService.getCandidatesBetweenTwoDates = async(startDate, endDate) => {
    const headers = await getHeaders();
    let csrf = await getCSRFToken();
    let response = await fetch("https://employers.indeed.com/api/ctws/preview/candidates?offset=0&encryptedJobId=0", {
        headers: {
            ...headers,
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "expires": "0",
            "indeed-client-application": "candidate-list",
            "pragma": "no-cache",
            "csrf": csrf
        },
        "body": null,
        "method": "GET"
    });

    if (response.status != 200) {
        throw Error('something went wrong, while fetching candidates');
    }

    let candidates = await response.json();
    candidates = candidates.candidates;


    if (candidates.length > 0) {
        return candidates.filter((candidate) => {
            let candidateDate = Moment(candidate.dateCreatedTimestamp).format("YYYY-MM-DD");
            return Moment(candidateDate, "YYYY-MM-DD").isBetween(Moment(startDate, "YYYY-MM-DD"), Moment(endDate, "YYYY-MM-DD"), undefined, '[]');
        });
    } else {
        throw Error("No Candidates were found for this date");
    }

}
ResumesService.transferAllResumesForOneJob = async(jobId) => {

    //validate : browser is open
    if (!BrowserService.page) {
        await BrowserService.getNewBrowser();
        // throw Error('Chromuim browser not open, please open it first');
    }

    //find the job by id
    let job = await Job.findOne({
        job_id: jobId,
    });

    //if job has no email get it
    let jobEmail;
    if (job.jobDetails_emails == null || job.jobDetails_emails.length == 0) {
        jobEmail = await ResumesService.getJobEmail(jobId);
    } else {
        jobEmail = job.jobDetails_emails[0];
    }


    //get latest candidates
    let jobCandidates = await ResumesService.getCandidatesDetails(jobId);

    //delete old job folder
    await ResumesService.deleteJobFolders(jobId);

    //send candidates one by one
    for (const candidate of jobCandidates) {

        // download resume
        await ResumesService.downloadResumesForOneCandidate(jobId, candidate.id);
        // send resume
        await ResumesService.sendEmail(jobId, candidate.id, jobEmail);

        // mark candidate as transfered
        await Job.updateOne({
            job_id: jobId,
        }, {
            $set: {
                "candidates.$[f].lasteTransferDate": Moment().format('DD MMMM YYYY hh:mm:ss'),
            }
        }, {
            arrayFilters: [{
                "f.id": candidate.id
            }, ],
        });
    }


    //delete old job folder
    await ResumesService.deleteJobFolders(jobId);
};



ResumesService.deleteCandidateFolder = async(jobId, candidateId) => {
    let folderPath = path.join(__dirname, '..', 'resumes', jobId, candidateId)
    try {
        fs.rmSync(folderPath, { recursive: true });
    } catch (error) {
        // console.log(error)
    }
};






ResumesService.deleteJobFolders = async(jobId) => {
    let jobFolderPath = path.join(__dirname, '..', 'resumes', jobId);
    try {
        fs.rmSync(jobFolderPath, { recursive: true });
    } catch (error) {
        // console.log(error)
    }
};

ResumesService.downloadResumesForOneCandidate = async(jobId, candidateId) => {
    await BrowserService.page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: path.join(__dirname, '..', 'resumes', jobId, candidateId) });
    try {
        await BrowserService.page.evaluate(() => window.stop());
        await BrowserService.page.goto(`https://employers.indeed.com/c/resume?id=${candidateId}&ctx=&isPDFView=false`, { waitUntil: "networkidle2" });
    } catch (error) {}
    await BrowserService.page.waitForTimeout(4000);
};


ResumesService.verifyIsFileExistAndGetResumeName = async(jobId, candidateId) => {

    //construct the path 
    let fileToCheckPath = path.join(__dirname, '..', 'resumes', jobId, candidateId);

    //get files in path 
    let filesInPath = fs.readdirSync(fileToCheckPath);

    //if files length = 0 or > 1 retrun false
    if (filesInPath.length == 0) {
        console.log('Error : No Resume file found in the job folder:  ');
        return false;
    }
    for (const fileName of filesInPath) {
        if (fileName.includes('Resume')) {
            return fileName;
        }
    }
    console.log('Error : Resume was not found in the job folder, maybe internet is slow and its taking too long to download, number of other files found: ', filesInPath.length);
    return false;

};




ResumesService.sendEmail = async(jobId, candidateId, jobEmail) => {
    let resumeName = await ResumesService.verifyIsFileExistAndGetResumeName(jobId, candidateId);
    if (!resumeName) {
        throw Error(`Can't send ${jobId}/${candidateId}, because this File Doesnt exists`);
    }
    let resumePath = path.join(__dirname, '..', 'resumes', jobId, candidateId, resumeName);


    // Send an email:
    var client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

    //Step 2: Setting up message options
    let messageParams = {
        From: `resumes@jeanshorts.careers`,
        // To: "anaskasmi98@gmail.com",
        To: jobEmail,
        Subject: resumeName,
        TextBody: `Resume Name: ${resumeName}, Job id : ${jobId} Candidate id : ${candidateId}`,
        MessageStream: "outbound"
    };

    // read the resume file, add it to the attachements then send the email
    fs.promises.readFile(resumePath, { encoding: 'base64' })
        .then(data => {
            const file = {
                "Name": resumeName,
                "Content": data,
                "ContentType": "application/octet-stream"

            }
            messageParams.Attachments = [file];
            return client.sendEmail(messageParams);
        })
        .then(response => {
            console.log(`${resumeName} was sent successfully ! `);
        })
        .catch(err => {
            throw new Error(err);
        });
};





module.exports = ResumesService;