const { normalizeJobs } = require('../utilities/normalizeJobs');
const { normalizeFullDetailedJob } = require('../utilities/normalizeFullDetailedJob');
const { findRangeType } = require('../utilities/findRangeType');
const Moment = require('moment');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
const { GraphQLClient, gql } = require('graphql-request')
const draftJobPostFieldsFragment = require('./graphQl-fragments/draftJobPostFieldsFragment');
//models
const Job = require('./../models/Job')
const BrowserService = require('./BrowserService');
const Helpers = require('../utilities/Helpers');
let JobsServices = {};

JobsServices.cookie = "CTK=1g6m99ugd210u001; _ga=GA1.3.262740312.1656457859; PPID=eyJraWQiOiJhNGRhMzNjZC00NWYyLTRkMzYtYjM2My02ZWZmYTc1OGUzYjMiLCJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJzdWIiOiJhY2QzZmJiYWU1ZmFiNjE2IiwiYXVkIjoiYzFhYjhmMDRmIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImxhc3RfMmZhIjoxNjU2NDU3OTAyMDAwLCJjcmVhdGVkIjoxNjAwMTA2NDQzMDAwLCJyZW1fbWUiOnRydWUsImlzcyI6Imh0dHBzOlwvXC9zZWN1cmUuaW5kZWVkLmNvbSIsImV4cCI6MTY1NjQ2NDAyMCwiaWF0IjoxNjU2NDYyMjIwLCJsb2dfdHMiOjE2NTY0NTc5MDIzMTAsImVtYWlsIjoiYW5hc0BrYXNtaS5kZXYifQ.7QU4OkAsWuivTSJ28BChlravmB5PJQLkaC8CILguBmB2IEB4iOXvLu81h2jGeky2TUO_g22ZrvI-UVyPf6MRCw; DRAWSTK=5e9bc1fe85d3e90d; _gid=GA1.3.237866782.1656457859; ADV=1; indeed_rcc=CTK; CSRF=aae1f9d1b889953f28294df60f165c1a; SURF=5kxiKmg7oUZmjsRaAIWgeWbUGvExZ44f; _gcl_au=1.1.1510833163.1656457856; PCA=d71582ec4597e44c; _gid=GA1.2.237866782.1656457859; INDEEDADS_HOME=6de620f32496e51e|anlyts; ADOC=2078510905073534; ENC_CSRF=R8tQa35AQWTazaOUgTkSYMVWLpcZKYMB; _ga=GA1.2.262740312.1656457859; __ssid=29f242d95edaecd045fe4b368e2511c; SOCK=\"B4vLkfdr95xKMb2hukcw_ZebO78=\"; SHOE=\"WI019BQQDrnphQNH16z5amnqmdYgPK6kZNa58PKrxL6I7qZ6aALVoJYPkKEHB4MT9te2WCOx4RjSpNK-v7ATFP8Xru2QX7eWupT5Xz3OKRpMzh5MRJvYHNWU3ALMdv9bNYmW5KfpEgAk\"; _gat_ga_tracker=1; _gat_UA-90780-1=1; mhit=2078510905073534; JSESSIONID=node014yn6x9ruvcvbcpjlxtwmkec67511.node0; _dd_s=rum=1&id=c1258bc5-eea1-4f00-b613-8b12f9beb210&created=1656462220311&expire=1656463722549; OptanonAlertBoxClosed=2022-06-29T00:33:42.554Z; OptanonConsent=isGpcEnabled=0&datestamp=Wed+Jun+29+2022+01%3A33%3A42+GMT%2B0100+(GMT%2B02%3A00)&version=6.30.0&isIABGlobal=false&hosts=&consentId=87509a77-bce8-4f93-b237-c15a9c39be11&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0007%3A0&AwaitingReconsent=false; _gali=onetrust-reject-all-handler";

JobsServices.openPostJobPage = async() => {
    await BrowserService.page.evaluate(() => window.stop());
    await BrowserService.page.goto(`https://employers.indeed.com/o/p`, { waitUntil: "networkidle2" });

    // chose new job posting
    await BrowserService.page.waitForXPath(`//*[@data-testid="JOBPOSTING_STARTNEW"]/parent::label`);
    let [newJobPostingOption] = await BrowserService.page.$x(`//*[@data-testid="JOBPOSTING_STARTNEW"]/parent::label`);
    await newJobPostingOption.click();

    let [continueButton] = await BrowserService.page.$x(`//*[@type="submit"]`);
    await continueButton.click();


    //reset filled values
    await BrowserService.page.waitForTimeout(2 * 1000);
    let [resetButton] = await BrowserService.page.$x(`//*[text()='Reset']/parent::button`);
    await resetButton.click();


}

JobsServices.fetchJobDataByIDFromAPI = async(jobId) => {

    let response = await fetch(`https://employers.indeed.com/j/jobs/view?id=${jobId}&indeedcsrftoken=${JobsServices.csrfToken}`, {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9",
            "indeed-client-application": "ic-jobs-management",
            "sec-ch-ua": "\"Google Chrome\";v=\"101\", \"Chromium\";v=\"101\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-datadog-origin": "rum",
            "x-datadog-parent-id": "8745621754032032889",
            "x-datadog-sampled": "1",
            "x-datadog-sampling-priority": "1",
            "x-datadog-trace-id": "4918356813273448204",
            "x-indeed-rpc": "1",
            "cookie": JobsServices.cookie,
            "Referer": `https://employers.indeed.com/em/job-details/${jobId}`,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    });

    return response.json();
}

JobsServices.getJobBenefits = async(jobId) => {
    let response = await fetch(`https://employers.indeed.com/j/jobs/view?id=${jobId}&indeedcsrftoken=${JobsServices.csrfToken}`, {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9",
            "indeed-client-application": "ic-jobs-management",
            "sec-ch-ua": "\"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-datadog-origin": "rum",
            "x-datadog-parent-id": "1256698936099227697",
            "x-datadog-sampled": "1",
            "x-datadog-sampling-priority": "1",
            "x-datadog-trace-id": "4781717318849204701",
            "x-indeed-rpc": "1",
            "cookie": JobsServices.cookie,
            "Referer": `https://employers.indeed.com/em/job-details/${jobId}`,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    });
    if (response.status != 200) {
        throw Error('cant getJobFullDetails !');
    }
    let responseData = (await response.json());
    let jobUrl = responseData.jobUrl;
    if (!jobUrl) {
        console.log('This job is newly posted and doesn\'t have a url, so we couldn\'t get the benefits list');
        return [];
    }

    if (!jobUrl.includes('https') && jobUrl.includes('http')) {
        jobUrl = jobUrl.replace('http://', 'https://');
    }

    await BrowserService.page.goto(jobUrl, { waitUntil: "networkidle2" });
    let benefits = await BrowserService.page.$x(`//*[@id="benefits"]/div/div/div/div/div`);
    let benefitsTexts = [];
    for (const benefitElemHandler of benefits) {
        benefitsTexts.push(await BrowserService.page.evaluate(benefitElemHandler => benefitElemHandler.innerText, benefitElemHandler));
    }
    return benefitsTexts;
}
JobsServices.getJobFullDetails = async(jobId) => {
    // get the benefits from the public job page
    let benefits = await JobsServices.getJobBenefits(jobId);
    // get the job data from indeed  api
    const job = await JobsServices.fetchJobDataByIDFromAPI(jobId);
    // normalize the job to fit the Mongo db model
    let normalizedJob = await normalizeFullDetailedJob(job);
    //delete old job document
    await Job.findOneAndDelete({ job_id: jobId });
    //update the job document
    normalizedJob.benefits = benefits;
    await Job.findByIdAndUpdate(jobId, normalizedJob);
    return normalizedJob;
}


JobsServices.downloadCookies = async() => {

    const cookies = await BrowserService.page.cookies();
    await fs.writeFile(path.join('cookies', 'cookies.json'), JSON.stringify(cookies, null, 2), function(err, result) {
        if (err) console.log('error in saving cookies', err);
    });
}


JobsServices.csrfToken = "aae1f9d1b889953f28294df60f165c1a";
JobsServices.getCSRFToken = async() => {
    if (!JobsServices.csrfToken) {
        await BrowserService.page.evaluate(() => window.stop());
        await BrowserService.page.goto(`https://employers.indeed.com/j?from=gnav-empcenter#jobs`);
        await BrowserService.page.waitForXPath(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'open')]`);
        const html = await BrowserService.page.evaluate(() => document.querySelector('*').outerHTML);
        JobsServices.csrfToken = html.split(`csrf":"`)[1];
        JobsServices.csrfToken = JobsServices.csrfToken.split(`"`)[0];
        console.log(JobsServices.csrfToken);
    }
}
JobsServices.scrapAllJobs = async() => {
    await JobsServices.getCSRFToken();
    let response = await fetch(`https://employers.indeed.com/plugin/icjobsmanagement/api/jobs?page=1&pageSize=200&sort=DATECREATED&order=DESC&status=ACTIVE%2CPAUSED&draftJobs=true&indeedcsrftoken=${JobsServices.csrfToken}`, {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9",
            "indeed-client-application": "ic-jobs-management",
            "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Mac OS X\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-datadog-origin": "rum",
            "x-datadog-parent-id": "6422981696088972811",
            "x-datadog-sampling-priority": "1",
            "x-datadog-trace-id": "3894650629907205849",
            "x-indeed-rpc": "1",
            "cookie": JobsServices.cookie,
            "Referer": "https://employers.indeed.com/jobs?page=1&pageSize=200&tab=0&field=DATECREATED&dir=DESC&status=open%2Cpaused",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    });

    const data = await response.json();
    console.log('Jobs Found : ' + data.jobs.length);
    let normalizedJobs = await normalizeJobs(data.jobs);
    await Job.deleteMany({});
    await Job.insertMany(normalizedJobs.reverse());
}

JobsServices.getAllJobsFromDb = async() => {

    return Job.find();

}

JobsServices.getJobDataFromDb = async(jobId) => {
    return Job.findOne({
        job_id: jobId,
    });

}

JobsServices.skipDuplicateJobPage = async() => {
    let [createNewJobOption] = await BrowserService.page.$x(`//*[@data-testid="create-new-job"]/parent::label`)
    if (createNewJobOption) {
        await createNewJobOption.click();
        await JobsServices.clickSaveAndContinue();
    }
}
JobsServices.unlockCompanyNameInput = async() => {
    //click pencil Icon
    await BrowserService.page.waitForXPath(`//*[@data-testid="display-field-edit" and contains(@title,'Company')]`);
    let [companyNamePencil] = await BrowserService.page.$x(`//*[@data-testid="display-field-edit" and contains(@title,'Company')]`);
    if (companyNamePencil) {
        await companyNamePencil.click();
    }

    //chose company name change reason
    await BrowserService.page.waitForXPath(`//*[@value="posting_on_behalf"]/parent::label`);
    let [companyNameChangeReason] = await BrowserService.page.$x(`//*[@value="posting_on_behalf"]/parent::label`);
    await companyNameChangeReason.click();

}

JobsServices.fillIn_CompanyName = async(companyName) => {
    await BrowserService.page.waitForXPath(`//*[@data-testid="job-company-name-change-input"]`);
    let [JobCompanyNameInput] = await BrowserService.page.$x(`//*[@data-testid="job-company-name-change-input"]`);
    await JobCompanyNameInput.click({ clickCount: 3 });
    await JobCompanyNameInput.press('Backspace');
    await JobCompanyNameInput.type(companyName);
}

JobsServices.fillIn_JobTitle = async(jobTitle) => {
    await BrowserService.page.waitForXPath(`//*[@data-testid="job-title"]`);
    let [jobTitleInput] = await BrowserService.page.$x(`//*[@data-testid="job-title"]`);
    await jobTitleInput.click({ clickCount: 3 });
    await jobTitleInput.press('Backspace');
    await jobTitleInput.type(jobTitle);
}

JobsServices.fillIn_JobCategory = async() => {
    //wait for 3 seconds to make sure that category exists 
    await BrowserService.page.waitForTimeout(3 * 1000);
    let [firstChoice] = await BrowserService.page.$x(`//*[@name="jobOccupationOption"]/label`)
    if (firstChoice) {
        await firstChoice.click();
    }
}

JobsServices.fillIn_industry = async() => {
    //wait for 3 seconds to make sure that the industry input exists 
    await BrowserService.page.waitForTimeout(3 * 1000);
    let [select] = await BrowserService.page.$x(`//*[@advertisercompanymetadataindustry]`)
    if (select) {
        await select.click();
        await BrowserService.page.waitForTimeout(1 * 1000);
        let [RestaurantsOption] = await BrowserService.page.$x(`//*[contains(@label,"Restaurants & Food")]`)
        await RestaurantsOption.click();
    }
}

JobsServices.fillIn_location = async(data) => {
    // open the location options
    await BrowserService.page.waitForXPath(`//*[@data-testid="role-location-input"]`);
    const [locationOption] = await BrowserService.page.$x(`//*[@data-testid="role-location-input"]`);
    await locationOption.click();
    await BrowserService.page.waitForTimeout(1 * 1000);
    await locationOption.click();

    // chose In person
    await BrowserService.page.waitForXPath(`//*[text()='In person']`);
    const [inPersonOption] = await BrowserService.page.$x(`//*[text()='In person']`);
    await inPersonOption.click();

    // location input 
    await BrowserService.page.waitForXPath(`//*[@data-testid="city-autocomplete"]`);
    const [locationInput] = await BrowserService.page.$x(`//*[@data-testid="city-autocomplete"]`);
    await locationInput.type(data.location);
    await locationInput.type(' ');
    await BrowserService.page.waitForTimeout(1000);
    await BrowserService.page.keyboard.press('ArrowDown');
    await BrowserService.page.waitForTimeout(1000);
    await BrowserService.page.keyboard.press('Enter');
    await BrowserService.page.waitForTimeout(5 * 1000);
}

JobsServices.clickSaveAndContinue = async() => {
    const [saveAndContinue] = await BrowserService.page.$x(`//*[@type="submit"]/parent::div`);
    if (saveAndContinue) {
        await saveAndContinue.click({ clickCount: 3 });
        await BrowserService.page.waitForTimeout(3000);
        // skip duplicate job page
        await JobsServices.skipDuplicateJobPage();

    } else {
        console.log('Error : cant find save button...');
    }


}

JobsServices.fillIn_isJobFullTimeOrPartTime = async(jobDetails_WhatTypeOfJobIsIt) => {

    //full time
    if (jobDetails_WhatTypeOfJobIsIt == 'FULLTIME') {
        await BrowserService.page.waitForXPath(`//*[text()='Full-time']`);
        let [fullTimeRadioButton] = await BrowserService.page.$x(`//*[text()='Full-time']`);
        await fullTimeRadioButton.click();
    }

    //part time    
    else if (jobDetails_WhatTypeOfJobIsIt == 'PARTTIME') {
        await BrowserService.page.waitForXPath(`//*[text()='Part-time']`);
        let [PartTimeRadioButton] = await BrowserService.page.$x(`//*[text()='Part-time']`);
        await PartTimeRadioButton.click();
    }
    // else full time
    else {
        console.log('we didnt know the type of employment :' + jobDetails_WhatTypeOfJobIsIt, 'now choosing full time...')
        await BrowserService.page.waitForXPath(`//*[text()='Full-time']`);
        let [fullTimeRadioButton] = await BrowserService.page.$x(`//*[text()='Full-time']`);
        await fullTimeRadioButton.click();
    }
}


JobsServices.expandAllSections = async() => {
    // click all more buttons
    await BrowserService.page.waitForTimeout(1000);
    let moreButtons = await BrowserService.page.$x(`//button[contains(text(),"more")]`);
    for (const moreButton of moreButtons) {
        await moreButton.click();
    }
}
JobsServices.fillIn_schedule = async() => {
    await JobsServices.expandAllSections();
    await BrowserService.page.waitForTimeout(3000);
    let otherOptions = await BrowserService.page.$x(`//*[@data-testid="job-schedule"]/following-sibling::label/div/div[text()="Other"]`);
    if (otherOptions.length > 0) {
        for (const otherOption of otherOptions) {
            await otherOption.click();
        }
    } else {
        let noneOptions = await BrowserService.page.$x(`//*[@data-testid="job-schedule"]/following-sibling::label/div/div[text()="None"]/parent::div`);
        if (noneOptions.length) {
            for (const noneOption of noneOptions) {
                await noneOption.click();
            }
        }
    }
}

JobsServices.fillIn_hiresNumber = async(jobDetails_intHiresNeeded) => {
    if (jobDetails_intHiresNeeded > 0 && jobDetails_intHiresNeeded <= 10) {
        await BrowserService.page.select('[data-testid="job-hires-needed"]', jobDetails_intHiresNeeded)
    } else {
        await BrowserService.page.select('[data-testid="job-hires-needed"]', 'TEN_PLUS')
    }
}

JobsServices.fillIn_deadline = async(jobDetails_expectedHireDate) => {
    await BrowserService.page.select('[data-testid="job-expected-hire-date"]', jobDetails_expectedHireDate)
}

JobsServices.fillIn_paymentType = async(jobDetails_salaryRangeType, jobDetails_SalaryFrom, jobDetails_SalaryTo) => {
    //find the salary Range Type
    if (jobDetails_salaryRangeType) {
        let jobSalaryRangeType = await BrowserService.page.$(`[name*='salaryRangeType']`);
        if (jobSalaryRangeType) {
            await BrowserService.page.select(`[name*='salaryRangeType']`, jobDetails_salaryRangeType)
            return true;
        }
    } else if (jobDetails_SalaryFrom && jobDetails_SalaryTo) {
        jobDetails_salaryRangeType = findRangeType(jobDetails_SalaryFrom, jobDetails_SalaryTo)
        let jobSalaryRangeType = await BrowserService.page.$(`[name*='salaryRangeType']`);
        if (jobSalaryRangeType) {
            await BrowserService.page.select(`[name*='salaryRangeType']`, jobDetails_salaryRangeType)
            return true;
        }
    } else {
        return false;
    }
}



JobsServices.fillIn_salaryFromAndTo = async(jobDetails_SalaryFrom, jobDetails_SalaryTo, jobDetails_salaryRangeType) => {
    let jobSalary1, jobSalary2;
    switch (jobDetails_salaryRangeType) {
        case 'UP_TO':
            //fill in salary 1 with jobDetails_SalaryTo
            [jobSalary1] = await BrowserService.page.$x(`//*[@id="local.temp-salary.minimum"]`);
            if (jobDetails_SalaryTo) {
                await jobSalary1.click({ clickCount: 3 });
                await jobSalary1.press('Backspace');
                await jobSalary1.type(jobDetails_SalaryTo)
                return true;
            } else {
                await jobSalary1.click({ clickCount: 3 });
                await jobSalary1.press('Backspace');
                return true;
            }
        case 'STARTING_AT':
            //fill in salary 1 with jobDetails_SalaryFrom
            [jobSalary1] = await BrowserService.page.$x(`//*[@id="local.temp-salary.minimum"]`);
            if (jobDetails_SalaryFrom) {
                await jobSalary1.click({ clickCount: 3 });
                await jobSalary1.press('Backspace');
                await jobSalary1.type(jobDetails_SalaryFrom)
                return true;
            } else {
                await jobSalary1.click({ clickCount: 3 });
                await jobSalary1.press('Backspace');
                return true;
            }

        case 'EXACT_RATE':
            //fill in salary 1 with jobDetails_SalaryFrom
            [jobSalary1] = await BrowserService.page.$x(`//*[@id="local.temp-salary.minimum"]`);
            if (jobDetails_SalaryFrom) {
                await jobSalary1.click({ clickCount: 3 });
                await jobSalary1.press('Backspace');
                await jobSalary1.type(jobDetails_SalaryFrom)
                return true;
            } else {
                await jobSalary1.click({ clickCount: 3 });
                await jobSalary1.press('Backspace');
                return true;
            }
            break;
        case 'RANGE':
            //fill in salary 1 with jobDetails_SalaryFrom and fill in salary 2 with jobDetails_SalaryTo
            [jobSalary1] = await BrowserService.page.$x(`//*[@id="local.temp-salary.minimum"]`);
            [jobSalary2] = await BrowserService.page.$x(`//*[@id="local.temp-salary.maximum"]`);
            if (jobDetails_SalaryFrom) {
                await jobSalary1.click({ clickCount: 3 });
                await jobSalary1.press('Backspace');
                await jobSalary1.type(jobDetails_SalaryFrom)
            } else {
                await jobSalary1.click({ clickCount: 3 });
                await jobSalary1.press('Backspace');
            }
            if (jobDetails_SalaryTo) {
                await jobSalary2.click({ clickCount: 3 });
                await jobSalary2.press('Backspace');
                await jobSalary2.type(jobDetails_SalaryTo)
            } else {
                await jobSalary2.click({ clickCount: 3 });
                await jobSalary2.press('Backspace');
            }
            return true;
        default:
            break;


    }

    return true;

}

JobsServices.fillIn_paymentFrom = async(jobDetails_SalaryFrom) => {
    let [jobSalary1] = await BrowserService.page.$x(`//*[@id="local.temp-salary.minimum"]`);
    if (jobSalary1 && jobDetails_SalaryFrom) {
        await jobSalary1.click({ clickCount: 3 });
        await jobSalary1.press('Backspace');
        await jobSalary1.type(jobDetails_SalaryFrom)
        return true;
    } else if (!jobDetails_SalaryFrom) {
        await jobSalary1.click({ clickCount: 3 });
        await jobSalary1.press('Backspace');
    } else {
        return false;
    }
}

JobsServices.fillIn_benefits = async(benefits) => {
    if (!benefits)
        return;

    await JobsServices.expandAllSections();

    for (const benefit of benefits) {
        let [benefitButton] = await BrowserService.page.$x(`//*[text()='${benefit}']`);
        if (benefitButton) {
            await benefitButton.click();
        }
    }
}


JobsServices.fillIn_paymentTo = async(jobDetails_SalaryTo, jobDetails_salaryRangeType) => {
    let jobSalaryInput;
    if (jobDetails_salaryRangeType == 'UP_TO') {
        [jobSalaryInput] = await BrowserService.page.$x(`//*[@id="local.temp-salary.minimum"]`);
    } else {
        [jobSalaryInput] = await BrowserService.page.$x(`//*[@id="local.temp-salary.maximum"]`);
    }
    if (jobSalaryInput && jobDetails_SalaryTo) {
        await jobSalaryInput.click({ clickCount: 3 });
        await jobSalaryInput.press('Backspace');
        await jobSalaryInput.type(jobDetails_SalaryTo)
        return true;
    } else if (!jobDetails_SalaryTo) {
        await jobSalaryInput.click({ clickCount: 3 });
        await jobSalaryInput.press('Backspace');
    } else {
        return false;
    }

}


JobsServices.fillIn_paymentPer = async(jobDetails_SalaryPer) => {
    let [jobSalaryPeriod] = await BrowserService.page.$x(`//*[@id="local.temp-salary.period"]`);
    if (jobSalaryPeriod && jobDetails_SalaryPer) {
        await BrowserService.page.select(`[name="local.temp-salary.period"]`, jobDetails_SalaryPer)
        return true;
    } else {
        return false;
    }
}

JobsServices.fillIn_description = async(jobDescription) => {

    await JobsServices.getCSRFToken();
    const jobId = (await BrowserService.page.url()).split('jobId=')[1];

    const mutation = gql `
      ${draftJobPostFieldsFragment}
      mutation SaveDraftJobPost($input: PatchDraftJobPostInput!) {
        patchDraftJobPost(input: $input) {
          result {
            draftJobPost {
              ...DraftJobPostFields
              __typename
            }
            __typename
          }
          __typename
        }
      }      
      `;
    const headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "indeed-api-key": "0f2b0de1b8ff96890172eeeba0816aaab662605e3efebbc0450745798c4b35ae",
        "indeed-client-sub-app": "job-posting",
        "indeed-client-sub-app-component": "./JobDescriptionSheet",
        "sec-ch-ua": "\"Google Chrome\";v=\"105\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"105\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Mac OS X\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "x-datadog-origin": "rum",
        "x-datadog-parent-id": "8923979220855812101",
        "x-datadog-sampling-priority": "1",
        "x-datadog-trace-id": "544488856865798606",
        "cookie": JobsServices.cookie,
        "Referer": "https://employers.indeed.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    const variables = {
        "input": {
            "id": jobId,
            "patch": {
                "description": jobDescription.toString(),
            }
        }
    }

    const client = new GraphQLClient("https://apis.indeed.com/graphql?locale=en-US&co=US", { headers })
    await client.request(mutation, variables);
    await BrowserService.page.reload()
    await BrowserService.page.waitForTimeout(2000);

}

JobsServices.fillIn_isResumeRequired = async() => {
    await BrowserService.page.waitForXPath(`//*[contains(@name,"resumeRequired") and @value="YES"]/parent::label`);
    let [resumeRequiredButton] = await BrowserService.page.$x(`//*[contains(@name,"resumeRequired") and @value="YES"]/parent::label`);
    await resumeRequiredButton.click();
    return true;
}

JobsServices.click_confirm = async() => {
    await BrowserService.page.waitForXPath(`//*[text()='Confirm']/parent::button`);
    let [confirmButton] = await BrowserService.page.$x(`//*[text()='Confirm']/parent::button`);
    await confirmButton.click();
}

JobsServices.click_skip = async() => {
    await BrowserService.page.waitForTimeout(1000);
    await BrowserService.page.waitForXPath(`//*[text()='Skip']/parent::button`);
    let [skipButton] = await BrowserService.page.$x(`//*[text()='Skip']/parent::button`);
    await skipButton.click();
}
JobsServices.skip_preview_page = async() => {

    await BrowserService.page.waitForXPath(`//*[text()='Confirm']/parent::button`);
    let [confirmButton] = await BrowserService.page.$x(`//*[text()='Confirm']/parent::button`);
    await confirmButton.click();
    await BrowserService.page.waitForTimeout(5000);
    await BrowserService.page.waitForXPath(`//*[text()='Skip']/parent::button`);
    let [skipButton] = await BrowserService.page.$x(`//*[text()='Skip']/parent::button`);
    await skipButton.click();

}
JobsServices.review_potential_matches = async() => {
    await BrowserService.page.waitForXPath(`//button[@value="MAYBE"]`);
    for (let index = 1; index <= 4; index++) {
        const maybeButtons = await BrowserService.page.$x(`//button[@value="MAYBE"]`);
        await maybeButtons[index].click();
        await BrowserService.page.waitForTimeout(500);
    }
    let [submitButton] = await BrowserService.page.$x(`//button[@type="submit"]`);
    await submitButton.click();


}

JobsServices.skip_qualifications = async() => {
    await BrowserService.page.waitForXPath(`//*[text()='Skip']/parent::button`);
    let [skipButton] = await BrowserService.page.$x(`//*[text()='Skip']/parent::button`);
    await skipButton.click();
}


JobsServices.click_advanced = async() => {
    await BrowserService.page.waitForXPath(`//*[text()='Advanced']/parent::button`);
    let [budgetAdvancedButton] = await BrowserService.page.$x(`//*[text()='Advanced']/parent::button`);
    await budgetAdvancedButton.click();
}

JobsServices.fillIn_adDurationType = async() => {
    await BrowserService.page.waitForXPath(`//*[@id="adEndDateSelect"]`);
    await BrowserService.page.select(`#adEndDateSelect`, "CUSTOM");
}

JobsServices.fillIn_adDurationDate = async(endDateIncreaseNumber) => {

    //generate new date after 4 days
    let newEndDate = Moment(Moment()).add(endDateIncreaseNumber, 'days');

    // change its Format
    newEndDate = newEndDate.format('MM/DD/YYYY');

    //fill in the input
    let [endDateInput] = await BrowserService.page.$x(`//*[@data-shield="end-date-picker"]/div/div/div/span/input`);
    await endDateInput.click({ clickCount: 3 });
    await BrowserService.page.keyboard.type(newEndDate)

    //second time
    for (let index = 0; index < 30; index++) {
        await endDateInput.press('Backspace');
    }
    await BrowserService.page.keyboard.type(newEndDate)

}

JobsServices.fillIn_CPC = async(budget_maxCPC) => {
    await BrowserService.page.waitForXPath(`//*[@id="maxcpc"]`);
    let [maxCPC] = await BrowserService.page.$x(`//*[@id="maxcpc"]`);
    if (budget_maxCPC) {
        await maxCPC.click({ clickCount: 3 });
        await maxCPC.press('Backspace');
        await maxCPC.type(budget_maxCPC);
        // await maxCPC.type('.31');
    }
}

JobsServices.fillIn_webSite = async() => {
    await BrowserService.page.waitForXPath(`//*[@name="CO_WEBSITE"]`);
    let [websiteInput] = await BrowserService.page.$x(`//*[@name="CO_WEBSITE"]`);
    if (websiteInput) {
        await websiteInput.click({ clickCount: 3 });
        await websiteInput.press('Backspace');
        await websiteInput.type('https://jobs.crelate.com/portal/misenplace');
    }
}

JobsServices.fillIn_adBudget = async(budget_amount) => {
    let [budgetInput] = await BrowserService.page.$x(`//*[@id="advanced-budget"]`);
    if (budgetInput && budget_amount) {
        let budgetInDollar = Math.ceil(budget_amount).toString();
        await budgetInput.click({ clickCount: 3 });
        await budgetInput.press('Backspace');
        await budgetInput.type(budgetInDollar)

        // add urgent label
        let [urgentLabel] = await BrowserService.page.$x(`//*[@name="urgentlyHiringCheckbox"]/parent::label`);
        await urgentLabel.click();

        return true;
    } else {
        return false;
    }


}

JobsServices.closeJob = async(jobId) => {

    await JobsServices.getCSRFToken();
    let response = await fetch(`https://employers.indeed.com/graphql?indeedcsrftoken=${JobsServices.csrfToken}`, {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "indeed-client-application": "ic-jobs-management",
            "sec-ch-ua": "\"Chromium\";v=\"98\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"98\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-datadog-origin": "rum",
            "x-datadog-parent-id": "1705804123429147222",
            "x-datadog-sampled": "1",
            "x-datadog-sampling-priority": "1",
            "x-datadog-trace-id": "5545931483359591976",
            "x-indeed-rpc": "1",
            "cookie": JobsServices.cookie,
            "Referer": `https://employers.indeed.com/em/job-details/${jobId}`,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `{\"query\":\"\\nmutation batchUpdateJobStatus {\\n_${jobId}: updateJob(id: \\\"${jobId}\\\", jobInput: { status: DELETED }) {\\n    status\\n}\\n}\"}`,
        "method": "POST"
    });
    if (response.status == 200) {
        console.log("Job closed Successfully :" + `https://employers.indeed.com/em/job-details/${jobId}`);
    } else {
        console.log("Job closing failed !");
        await BrowserService.page.goto(`https://employers.indeed.com/em/job-details/${jobId}`, { waitUntil: 'load' });
    }

}

JobsServices.fillIn_email = async(jobDetails_emails) => {
    //fill in the email input
    await BrowserService.page.waitForXPath(`//*[@type="email"]`);
    let [emailInput] = await BrowserService.page.$x(`//*[@type="email"]`);
    await emailInput.click({ clickCount: 3 });
    await emailInput.press('Backspace');
    await Helpers.clearInput();
    await emailInput.type(jobDetails_emails);
    await BrowserService.page.waitForTimeout(2000);
}

JobsServices.close_questions = async() => {
    await BrowserService.page.waitForTimeout(2000);
    let xButtons = await BrowserService.page.$x(`//*[contains(@id,'CloseButton')]`);
    for (const xButton of xButtons) {
        await xButton.click();
    }
    let [submitButton] = await BrowserService.page.$x(`//button[@type="submit"]`);
    await submitButton.click();

}

JobsServices.click_skip = async() => {
    await BrowserService.page.waitForTimeout(1000);
    let skipButton = await BrowserService.page.$x(`//span[contains(text(),'Skip')]`);

    if (skipButton && skipButton[1])
        await skipButton[1].click();
}

JobsServices.fillIn_isJobRemote = async() => {
    await BrowserService.page.waitForXPath(`//*[@for="radio-work_remotely-NO"]`);
    let [noButton] = await BrowserService.page.$x(`//*[@for="radio-work_remotely-NO"]`);
    await noButton.click();
    await BrowserService.page.waitForTimeout(200);
    await noButton.click();

}
JobsServices.fillIn_otherBenefits = async() => {
    // await BrowserService.page.waitForXPath(`//*[contains(text(),'None')]/parent::label`);
    // let noneButton = await BrowserService.page.$x(`//*[contains(text(),'None')]/parent::label`);
    // await noneButton[0].click();
    // await BrowserService.page.waitForTimeout(200);
}

module.exports = JobsServices;