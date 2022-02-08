const BrowserService = require('./BrowserService');
const path = require('path');
const fs = require('fs');
const { resolve, join } = require('path');
const nodemailer = require('nodemailer');
const Job = require('./../models/Job')
const Moment = require('moment');




let ResumesService = {};


ResumesService.getJobEmail = async(jobId) => {
    try {
        //if job has email return it 
        let job = await Job.findOne({
            job_id: jobId,
        });

        if (job && job.jobDetails_emails != null && job.jobDetails_emails.length > 0) {
            return job.jobDetails_emails[0];
        }
        if (!BrowserService.page) {
            throw Error('Chromuim browser not open, please open it first');
        }
        // else grab it from indeed
        let emails = [];
        BrowserService.page.on('response', function getJobIdFromJobPage(response) {
            if (response.url().includes('jobs/view?id=')) {
                response.json().then((res) => {
                    if (res.job) {
                        emails = res.job.emails;
                        BrowserService.page.removeListener('response', getJobIdFromJobPage);
                    }
                })
            }
        });
        let emailFound = false;
        let numberOfRetries = 5;
        while (!emailFound && numberOfRetries != 0) {
            // show this if its not the first time reloading
            if (numberOfRetries < 5) {

                console.log(`job with id ${jobId} doesnt seem to have an email`);
                console.log("reloading page ...", numberOfRetries, 'Number Of Retries left');
            }
            await BrowserService.page.evaluate(() => window.stop());
            await BrowserService.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobId}`);
            await BrowserService.page.waitForTimeout(3000);
            await BrowserService.page.waitForXPath(`//*[@id="plugin_container_MainContent"]`);

            // check emails
            if (emails && emails.length) {
                //save the new email if job in db
                await Job.findOneAndUpdate({
                    job_id: jobId,
                }, {
                    jobDetails_emails: emails
                });
                emailFound = true;
            }
            numberOfRetries--;
        }

        // return it
        return emails[0];

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
        throw Error('Chromuim browser not open, please open it first');
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
        throw Error('Chromuim browser not open, please open it first');
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
        throw Error('Chromuim browser not open, please open it first');
    }
    for (const candidate of candidatesList) {

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

    }
}
ResumesService.getCandidatesBetweenTwoDates = async(startDate, endDate) => {
    //validate : browser is open
    if (!BrowserService.page) {
        throw Error('Chromuim browser not open, please open it first');
    }


    let candidates = [];
    BrowserService.page.on('response', function getCandidatesFromResponse(response) {
        if (response.url().includes('/api/ctws/preview/candidates?offset=0')) {
            response.json().then((res) => {
                if (res.candidates) {
                    candidates = res.candidates;
                    BrowserService.page.removeListener('response', getCandidatesFromResponse);
                }
            })
        }
    });

    await BrowserService.page.goto(`https://employers.indeed.com/c#candidates?id=0&sort=date&order=desc&statusName=0`, { waitUntil: "load" });
    await BrowserService.page.waitForXPath(`//*[@id="plugin_container_MainContent"]`);

    if (candidates.length == 0) {
        await BrowserService.page.waitForTimeout(2000);
        await BrowserService.page.reload({ waitUntil: "load" });
        await BrowserService.page.waitForTimeout(3000);
    }

    if (candidates.length > 0) {
        return candidates.filter((candidate) => {
            let candidateDate = Moment(candidate.dateCreatedTimestamp).format("YYYY-MM-DD");
            return Moment(candidateDate, "YYYY-MM-DD").isBetween(Moment(startDate, "YYYY-MM-DD"), Moment(endDate, "YYYY-MM-DD"), undefined, '[]');
        });
    } else {
        throw Error("No Candidates were found, please try again");
    }

}
ResumesService.transferAllResumesForOneJob = async(jobId) => {

    //validate : browser is open
    if (!BrowserService.page) {
        throw Error('Chromuim browser not open, please open it first');
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
        await BrowserService.page.goto(`https://employers.indeed.com/c/resume?id=${candidateId}&ctx=&isPDFView=false`, { waitUntil: "networkidle2" });
    } catch (error) {}
    await BrowserService.page.waitForTimeout(3000);
};


ResumesService.verifyIsFileExistAndGetResumeName = async(jobId, candidateId) => {

    //construct the path 
    let fileToCheckPath = path.join(__dirname, '..', 'resumes', jobId, candidateId);

    //get files in path 
    let filesInPath = fs.readdirSync(fileToCheckPath);

    //if files length = 0 or > 1 retrun false
    if (filesInPath.length != 1) {
        console.log('Error : Files Length is different than 1 -- files Length :  ', filesInPath.length);
        return false;
    }

    //get the first file
    return filesInPath[0];
};




ResumesService.sendEmail = async(jobId, candidateId, jobEmail) => {

    let resumeName = await ResumesService.verifyIsFileExistAndGetResumeName(jobId, candidateId);
    if (!resumeName) {
        throw Error(`Can't send ${jobId}/${candidateId}, because this File Doesnt exists`);
    }
    let resumePath = path.join(__dirname, '..', 'resumes', jobId, candidateId, resumeName);
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAILSENDER_EMAIL,
            pass: process.env.EMAILSENDER_PASS,
        }
    });

    //Step 2: Setting up message options
    const messageOptions = {
        // to: "anaskasmi98@gmail.com",
        to: jobEmail,
        from: process.env.EMAILSENDER_EMAIL,
        attachments: [{
            filename: resumeName,
            path: resumePath,
        }, ]
    };
    //Step 3: Sending email
    await transporter.sendMail(messageOptions);


};





module.exports = ResumesService;