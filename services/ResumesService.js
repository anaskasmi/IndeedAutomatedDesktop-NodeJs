const BrowserService = require('./BrowserService');
const path = require('path');
const fs = require('fs');
const { resolve } = require('path');
const nodemailer = require('nodemailer')





let ResumesService = {};



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
        }
    });

    // go to 
    await BrowserService.page.goto(`https://employers.indeed.com/c#candidates?id=${jobId}&sort=datedefault&order=desc&statusName=0`, { waitUntil: "load" });


    await ResumesService.deleteJobFolders(jobId);
    for (const candidateRetrieved of candidatesRetrieved) {

        //download resumes
        await ResumesService.downloadResumesForOneCondidate(candidateRetrieved);

        //verify if file exists
        let fileName = await ResumesService.verifyIsFileExist(candidateRetrieved)

        //add the needed properties to the candidate object
        if (fileName) {
            candidateRetrieved.resumeName = fileName;
            candidateRetrieved.resumePath = path.join(__dirname, '..', 'resumes', candidateRetrieved.jobId, candidateRetrieved.id, fileName);;
            candidateRetrieved.folderPath = path.join(__dirname, '..', 'resumes', candidateRetrieved.jobId, candidateRetrieved.id);;
            console.log('found ');
        } else {
            console.log('Not Found ');
            return false;
        }

        //send the resume via email
        await ResumesService.sendEmail(candidateRetrieved, jobEmail);

        //delete the resume
        await ResumesService.deleteResume(candidateRetrieved);
    }
    await ResumesService.deleteJobFolders(jobId);

};



ResumesService.deleteResume = async(candidateObj) => {
    try {
        fs.rmdirSync(candidateObj.folderPath, { recursive: true });
    } catch (error) {
        console.log(error)
    }
};



ResumesService.getJobEmail = async(jobId) => {

    let emails = [];
    BrowserService.page.on('response', function getJobIdFromJobPage(response) {
        if (response.url().includes('jobs/view?id=')) {
            response.json().then((res) => {
                if (res.job) {
                    let job = res.job;
                    emails = job.emails;
                }
            })
        }
    });

    // go to 
    await BrowserService.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobId}`, { waitUntil: "load" });

    // check emails
    if (emails || emails.length) {
        return emails[0];
    } else {
        return false;
    }

};




ResumesService.deleteJobFolders = async(jobId) => {
    let jobFolderPath = path.join(__dirname, '..', 'resumes', jobId);;
    try {
        fs.rmdirSync(jobFolderPath, { recursive: true });
    } catch (error) {
        console.log(error)
    }
};

ResumesService.downloadResumesForOneCondidate = async(candidateObj) => {
    await BrowserService.page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: path.join(__dirname, '..', 'resumes', candidateObj.jobId, candidateObj.id) });
    try {
        await BrowserService.page.goto(`https://employers.indeed.com/c/resume?id=${candidateObj.id}&ctx=&isPDFView=false`, { waitUntil: "networkidle2" });
    } catch (error) {}
    await BrowserService.page.waitForTimeout(5000);
};


ResumesService.verifyIsFileExist = async(candidateObj) => {

    //construct the path 
    let fileToCheckPath = path.join(__dirname, '..', 'resumes', candidateObj.jobId, candidateObj.id);

    //get files in path 
    let filesInPath = fs.readdirSync(fileToCheckPath);

    //if files length = 0 or > 1 retrun false
    if (filesInPath.length != 1) {
        console.log('Error : Files Length is different than 1 -- files Length :  ', filesInPath.length);
        return false;
    }

    //get the first file
    let fileName = filesInPath[0];

    //if file name includes candidate name return true 
    if (fileName.includes(candidateObj.resumeName)) {
        return fileName;
    } else {
        return false;
    }
};




ResumesService.sendEmail = async(candidateObj, jobEmail) => {

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
            filename: candidateObj.resumeName,
            path: candidateObj.resumePath,
        }, ]
    };
    //Step 3: Sending email
    await transporter.sendMail(messageOptions);


};





module.exports = ResumesService;