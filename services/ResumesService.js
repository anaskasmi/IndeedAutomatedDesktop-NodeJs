const BrowserService = require('./BrowserService');
const path = require('path');
const fs = require('fs');
const { resolve, join } = require('path');
const nodemailer = require('nodemailer');
const Job = require('./../models/Job')
const Moment = require('moment');
const fetch = require('node-fetch');
const JobsServices = require('./jobsServices');




let ResumesService = {};


ResumesService.getJobEmail = async(jobId) => {
    try {
        //if job has email return it 
        let job = await Job.findOne({
            job_id: jobId,
        });

        if (!job || !job.jobDetails_emails || job.jobDetails_emails.length == 0) {
            let response = await fetch(`https://employers.indeed.com/j/jobs/view?id=${jobId}&indeedcsrftoken=YKGiLse8FqgRtGzotYeVVrLOXKBH0EXx`, {
                "headers": {
                    "accept": "application/json",
                    "accept-language": "en-US,en;q=0.9",
                    "indeed-client-application": "ic-jobs-management",
                    "sec-ch-ua": "\"Chromium\";v=\"98\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"98\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-datadog-origin": "rum",
                    "x-datadog-parent-id": "4916848497291186240",
                    "x-datadog-sampled": "1",
                    "x-datadog-sampling-priority": "1",
                    "x-datadog-trace-id": "5631816418804730996",
                    "x-indeed-rpc": "1",
                    "cookie": "PCA=d71582ec4597e44c; ENC_CSRF=FZ28ZsZgL9YVB19O3cdGNyz1L8WB4OqQ; SHOE=\"SqK8kBnRzeUS1sU--H1Dj4KgkBZYEQhdWESMecOgHbqMpQZf2G55lVEUsstMux57kkQxH4npLWVnQCcGI5r3CukZKcM9cOJG2V7W8PKdVOqSfVLgHXyBLlHxISlwxGxUiw0AfisPWco=\"; __ssid=9a246326ee1c8eb163b789c953dd971; _ga=GA1.2.2074404572.1628624164; CSRF=YKGiLse8FqgRtGzotYeVVrLOXKBH0EXx; SOCK=\"R5k9sLaUHmqUCY8-pcnmH75RN54=\"; SURF=St2AaCFM7FQQMCc8sDRD7NiaoGLEexE9; indeed_rcc=CTK; CTK=1fsn1merd2lei001; ADOC=2078510905073534; _gcl_au=1.1.858096582.1645746024; _ga=GA1.3.2074404572.1628624164; _gid=GA1.3.738594239.1645746025; DRAWSTK=2386b3b95fd0494b; PPID=eyJraWQiOiJmNmJkN2U4Zi02MmQyLTQ5ZDAtOTA1ZS1kNjVhMTBlOTVhZjIiLCJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJzdWIiOiJhY2QzZmJiYWU1ZmFiNjE2IiwiYXVkIjoiYzFhYjhmMDRmIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImNyZWF0ZWQiOjE2MDAxMDY0NDMwMDAsInJlbV9tZSI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL3NlY3VyZS5pbmRlZWQuY29tIiwiZXhwIjoxNjQ1NzQ3ODE3LCJpYXQiOjE2NDU3NDYwMTcsImxvZ190cyI6MTYyODYyNDE5ODIxMCwiZW1haWwiOiJhbmFzQGthc21pLmRldiJ9.Q35Sa_saNOxh8pdePM8tZ4-oMISsxfg3o6i5e49yvoVTfP2tgbR0D_scxPTRQuOlZC8vxwq8sWhbzipGz3JS6w; INDEEDADS_HOME=6de620f32496e51e|draw; ADV=1; _clck=bfv4r2|1|ez9|0; _gat_UA-90780-1=1; _clsk=11iwods|1645746229911|2|0|l.clarity.ms/collect; JSESSIONID=node0wpgyfyny2q5xy41901fxe5wo172150.node0; LC=co=US&hl=en; _dd_s=rum=1&id=6d9f2404-0fc9-49e8-9dc3-a52a18c1c511&created=1645746022174&expire=1645747137706; _uetsid=23ae7e8095cb11ec81baebc71a21a576; _uetvid=23aebdf095cb11eca68ae96dd78aa738; _gat_ga_tracker=1",
                    "Referer": `https://employers.indeed.com/em/job-details/${jobId}`,
                    "Referrer-Policy": "strict-origin-when-cross-origin"
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

    let response = await fetch("https://employers.indeed.com/api/ctws/preview/candidates?offset=0&encryptedJobId=0", {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9",
            "indeed-client-application": "entcand",
            "sec-ch-ua": "\"Chromium\";v=\"98\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"98\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-datadog-origin": "rum",
            "x-datadog-parent-id": "8433130470897912863",
            "x-datadog-sampled": "1",
            "x-datadog-sampling-priority": "1",
            "x-datadog-trace-id": "1961136418978072551",
            "x-indeed-api": "1",
            "x-indeed-appname": "entcand",
            "x-indeed-apptype": "desktop",
            "x-indeed-rpc": "1",
            "x-indeed-tk": "1fsn0p1kt36a0000",
            "cookie": "PCA=d71582ec4597e44c; ENC_CSRF=FZ28ZsZgL9YVB19O3cdGNyz1L8WB4OqQ; SHOE=\"SqK8kBnRzeUS1sU--H1Dj4KgkBZYEQhdWESMecOgHbqMpQZf2G55lVEUsstMux57kkQxH4npLWVnQCcGI5r3CukZKcM9cOJG2V7W8PKdVOqSfVLgHXyBLlHxISlwxGxUiw0AfisPWco=\"; __ssid=9a246326ee1c8eb163b789c953dd971; _ga=GA1.2.2074404572.1628624164; CSRF=YKGiLse8FqgRtGzotYeVVrLOXKBH0EXx; SOCK=\"R5k9sLaUHmqUCY8-pcnmH75RN54=\"; SURF=St2AaCFM7FQQMCc8sDRD7NiaoGLEexE9; indeed_rcc=CTK; CTK=1fsn0jtm3qauc801; ADOC=2078510905073534; _gcl_au=1.1.1539772095.1645744892; DRAWSTK=68b07561999fec2c; PPID=eyJraWQiOiJmNmJkN2U4Zi02MmQyLTQ5ZDAtOTA1ZS1kNjVhMTBlOTVhZjIiLCJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJzdWIiOiJhY2QzZmJiYWU1ZmFiNjE2IiwiYXVkIjoiYzFhYjhmMDRmIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImNyZWF0ZWQiOjE2MDAxMDY0NDMwMDAsInJlbV9tZSI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL3NlY3VyZS5pbmRlZWQuY29tIiwiZXhwIjoxNjQ1NzQ2Njg1LCJpYXQiOjE2NDU3NDQ4ODUsImxvZ190cyI6MTYyODYyNDE5ODIxMCwiZW1haWwiOiJhbmFzQGthc21pLmRldiJ9.ePgxXX1wRk5BF8i9imlCEaxUJDoNXzcfYYD8TWuE4GAVBsC8PeQBCwvToJtjJ-bJqjmrz7sZ37vvHUAIJh4ggA; INDEEDADS_HOME=6de620f32496e51e|draw; ADV=1; _clck=5sd5s0|1|ez9|0; mhit=2078510905073534; LC=co=US&hl=en; LOCALE=en; _mkto_trk=id:699-SXJ-715&token:_mch-indeed.com-1645744951492-38440; _uetsid=8118571095c811eca473f57a58a41d1d; _uetvid=811895b095c811ecb2f709a0f63fed5a; _clsk=1c5c5a1|1645745021147|5|0|www.clarity.ms/eus2-b/collect; _dd_s=rum=1&id=dcf46f48-2a3c-46af-a440-531833708f55&created=1645744890464&expire=1645745956257; JSESSIONID=2EEA419B6045645A86B10B2EE83D8A25",
            "Referer": "https://employers.indeed.com/c",
            "Referrer-Policy": "strict-origin-when-cross-origin"
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
        await BrowserService.page.evaluate(() => window.stop());
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