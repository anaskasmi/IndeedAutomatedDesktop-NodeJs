const BrowserService = require('./BrowserService');
const path = require('path');
const fs = require('fs');
const { resolve, join } = require('path');
const nodemailer = require('nodemailer');
const Job = require('./../models/Job')
const Moment = require('moment');




let ResumesService = {};


ResumesService.getJobEmail = async(jobId) => {

    //if job has email return it 
    let job = await Job.findOne({
        job_id: jobId,
    });
    if (job.jobDetails_emails != null && job.jobDetails_emails.length > 0) {
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
                    let job = res.job;
                    emails = job.emails;
                    BrowserService.page.removeListener('response', getJobIdFromJobPage);
                }
            })
        }
    });

    // go to 
    await BrowserService.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobId}`, { waitUntil: "load" });
    await BrowserService.page.waitForXPath(`//*[@id="plugin_container_JobDescriptionPageTop"]`);
    // check emails
    if (emails || emails.length) {
        //svae the new email
        job.emails = emails;
        await Job.findOneAndUpdate({
            job_id: jobId,
        }, {
            jobDetails_emails: emails
        })
        await job.save();
        // return it
        return emails[0];
    } else {
        return false;
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
                    for (let index = 0; index < candidatesFromResponse.length; index++) {
                        try {
                            const currentCandidate = candidatesFromResponse[index];
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

    //validate : job has candidate 
    let jobHasThisCandidatesId = job.candidates.filter(candidate => {
        return candidate.id == candidateId;
    })
    if (!jobHasThisCandidatesId) {
        throw Error('This Job Doesn\'t exist, please refresh the jobs page and try again');
    }

    // delete old folder 
    await ResumesService.deleteCandidateFolder(jobId, candidateId);

    // download candidates resume
    await ResumesService.downloadResumesForOneCondidate(jobId, candidateId);

    // transfer via email 
    if (job.jobDetails_emails != null && job.jobDetails_emails.length > 0) {
        // await ResumesService.sendEmail(jobId, candidateId, job.jobDetails_emails[0]);
        await ResumesService.sendEmail(jobId, candidateId, "anaskasmi98@gmail.com");
    } else {
        throw Error('This Job Doesn\'t have an Email yet, please click the get email button first');
    }

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


ResumesService.downloadResumesForOneJob = async(jobId) => {

    let jobEmail = await ResumesService.getJobEmail(jobId);
    if (!jobEmail) {
        console.log('no job email was found for this job : ' + jobId);
        return;
    }
    let candidatesRetrieved = [];
    BrowserService.page.on('response', function getCandidatesFromJobPage(response) {
        if (response.url().includes('preview/candidates')) {
            response.json().then((res) => {
                if (res.candidates) {
                    let candidatesFromResponse = res.candidates
                    for (let index = 0; index < candidatesFromResponse.length; index++) {
                        try {
                            const currentCandidate = candidatesFromResponse[index];
                            let candidateId = currentCandidate.candidateId;
                            let resumeName = 'Resume' + currentCandidate.name.replace(' ', '');
                            candidatesRetrieved.push({
                                id: candidateId,
                                resumeName,
                                jobId
                            });
                        } catch (error) {
                            console.log(error.message);
                        }
                    }
                }
            })
            BrowserService.page.removeListener('response', getCandidatesFromJobPage);
        }
    });

    // go to 
    await BrowserService.page.goto(`https://employers.indeed.com/c#candidates?id=${jobId}&sort=datedefault&order=desc&statusName=0`, { waitUntil: "load" });
    await BrowserService.page.waitForXPath(`//*[@id="employerAssistTooltipWrapper"]`);


    await ResumesService.deleteJobFolders(jobId);
    for (const candidateRetrieved of candidatesRetrieved) {

        //download resumes
        await ResumesService.downloadResumesForOneCondidate(candidateRetrieved);

        //verify if file exists
        let fileName = await ResumesService.verifyIsFileExist(candidateRetrieved)

        //add the needed properties to the candidate object
        if (fileName) {
            candidateRetrieved.resumeName = fileName;
            candidateRetrieved.resumePath = path.join(__dirname, '..', 'resumes', candidateRetrieved.jobId, candidateRetrieved.id, fileName);
            candidateRetrieved.folderPath = path.join(__dirname, '..', 'resumes', candidateRetrieved.jobId, candidateRetrieved.id);
            console.log('found ');
        } else {
            console.log('Not Found ');
            return false;
        }

        //send the resume via email
        await ResumesService.sendEmail(candidateRetrieved, jobEmail);

        //delete the resume
        await ResumesService.deleteCandidateFolder(candidateRetrieved);
    }
    await ResumesService.deleteJobFolders(jobId);

};



ResumesService.deleteCandidateFolder = async(jobId, candidateId) => {
    let folderPath = path.join(__dirname, '..', 'resumes', jobId, candidateId)
    try {
        fs.rmdirSync(folderPath, { recursive: true });
    } catch (error) {
        console.log(error)
    }
};






ResumesService.deleteJobFolders = async(jobId) => {
    let jobFolderPath = path.join(__dirname, '..', 'resumes', jobId);
    try {
        fs.rmdirSync(jobFolderPath, { recursive: true });
    } catch (error) {
        console.log(error)
    }
};

ResumesService.downloadResumesForOneCondidate = async(jobId, candidateId) => {
    await BrowserService.page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: path.join(__dirname, '..', 'resumes', jobId, candidateId) });
    try {
        await BrowserService.page.goto(`https://employers.indeed.com/c/resume?id=${candidateId}&ctx=&isPDFView=false`, { waitUntil: "networkidle2" });
    } catch (error) {}
    await BrowserService.page.waitForTimeout(5000);
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