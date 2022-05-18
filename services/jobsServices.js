const { normalizeJobs } = require('../utilities/normalizeJobs');
const { normalizeFullDetailedJob } = require('../utilities/normalizeFullDetailedJob');
const { findRangeType } = require('../utilities/findRangeType');
const Moment = require('moment');
const axios = require('axios');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
//models
const Job = require('./../models/Job')
const BrowserService = require('./BrowserService');
const Helpers = require('../utilities/Helpers');
const { saveCookies } = require('../utilities/saveCookies');
let JobsServices = {};

JobsServices.cookie = "CTK=1fons205gq95n800; _ga=GA1.2.1290977942.1641478710; __ssid=bf8ae6e35787c381087fda8d23d5747; indeed_rcc=CTK; optimizelyEndUserId=oeu1641993689011r0.2506574572419835; _gcl_au=1.1.529284552.1646848796; OptanonConsent=isIABGlobal=false&datestamp=Wed+Mar+09+2022+18%3A59%3A58+GMT%2B0100+(UTC%2B01%3A00)&version=6.30.0&hosts=&consentId=a5e28c21-527d-4479-bfa8-37f6f154a213&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1%2CC0007%3A1&isGpcEnabled=0&AwaitingReconsent=false; CO=US; LOCALE=en; _gid=GA1.2.719067217.1652148645; SURF=ajWNfC3kKEWt5wAf755cSGhHpcM2Kv3Y; CSRF=bUW4RbPHjgJ2S9m577tFsW4FxkggWhan; SHARED_INDEED_CSRF_TOKEN=HV2bVQekiaSvBwbtApejHxWFXEs9CMCb; gonetap=1; PPEDIT=1652194083; PPID=eyJraWQiOiI5OTlhOWE1Yy00YjhhLTQwNzktYjZkMy0xYTRkZTZjYWU1NTIiLCJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJzdWIiOiJiNTdhZWEyNmFmZmY0YjM5IiwiYXVkIjoiYzFhYjhmMDRmIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF1dGgiOiJnb29nbGUiLCJjcmVhdGVkIjoxNjAwMDE0Mzg3MDAwLCJyZW1fbWUiOnRydWUsImlzcyI6Imh0dHBzOlwvXC9zZWN1cmUuaW5kZWVkLmNvbSIsImV4cCI6MTY1MjE5NTkwMCwiaWF0IjoxNjUyMTk0MTAwLCJsb2dfdHMiOjE2NTIxOTQxMDAyMDMsImVtYWlsIjoiYW5hc2thc21pOThAZ21haWwuY29tIn0.-ufVpD6orRjS1W-h7YNUQTCi4FH4BuJwitmE71vNj2HmLe3mY9dlhDLFrDDb4HVVToqNe-7x9HfiHEgnO8v7VA; SOCK=\"wGFnw4sYhE5AdKlleEPSAv8hmT4=\"; SHOE=\"5KyiIc0v0PxOyohmbGKUCd6raSUMUqtK0g_CPLIHhLkq53RW2uH8yLz3X0NoXikkxRvcxl7sTybxaj9Rp1Z2OocsMU_PKVDH_OVbC_CmquKUrdmCrvCLCQn8GV0pVtcILBYCa-qhRlGUWR2VJ5LEh4bAtQ==\"; LC=co=US&hl=en; PCA=d71582ec4597e44c; DRAWSTK=656d9199bb193747; ADOC=2078510905073534; mhit=2078510905073534; INDEEDADS_HOME=6de620f32496e51e|draw; ADV=1; _ga=GA1.3.1290977942.1641478710; _gid=GA1.3.719067217.1652148645; g_state={\"i_l\":1,\"i_p\":1652201367794}; _clck=10gn0uv|1|f1c|0; ENC_CSRF=F9iJQWong5d8ki38Sovio60L7hDhW38t; _gat_ga_tracker=1; _gat_UA-90780-1=1; _uetsid=5f5fdbf0d07011ecb5898f382275259c; _uetvid=5f603510d07011ecb3ec63c0912038c1; _clsk=xhgz0v|1652195100101|4|0|l.clarity.ms/collect; JSESSIONID=node0be0ri3tiel941hve5fcryyhd73613.node0; _dd_s=rum=1&id=08ddec66-0d5e-486e-818b-255c880fa3ea&created=1652194119386&expire=1652195983859";

JobsServices.openPostJobPage = async() => {
    await BrowserService.page.evaluate(() => window.stop());
    await BrowserService.page.goto(`https://employers.indeed.com/o/p`, { waitUntil: "networkidle2" });

    if ((await BrowserService.page.url().includes('o/p/posting/orientation'))) {
        let [submitButton] = await BrowserService.page.$x(`//*[@type="submit"]`)
        if (submitButton) {
            await submitButton.click();
            await BrowserService.page.waitForNavigation({ waitUntil: "networkidle2" });
        }
    }
    // handle survey page 
    let [surveyPageIndicator] = await BrowserService.page.$x(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'Before We Start')]`);
    if (surveyPageIndicator) {
        let [IDidntHireChoice] = await BrowserService.page.$x(`//*[@name="did-you-hire-radio"]/parent::label`);
        if (IDidntHireChoice) {
            await IDidntHireChoice.click();

            //click other
            await BrowserService.page.waitForXPath(`//*[@name="other"]/parent::label`);
            let [otherButton] = await BrowserService.page.$x(`//*[@name="other"]/parent::label`);
            if (otherButton) {
                await otherButton.click();
            }

            // click submit
            await BrowserService.page.waitForXPath(`//*[@type="submit"]`);
            let [submitButton] = await BrowserService.page.$x(`//*[@type="submit"]`)
            if (submitButton) {
                await submitButton.click();
                await BrowserService.page.waitForNavigation({ waitUntil: "networkidle2" });
            }

        }
    }

    // handle introduction page 
    let [introPageIndicator] = await BrowserService.page.$x(`//*[@for="StartFromScratch-radio"]`);
    if (introPageIndicator) {
        await introPageIndicator.click();
        await BrowserService.page.waitForXPath(`//*[@type="submit"]`);
        let [submitButton] = await BrowserService.page.$x(`//*[@id="sheet-next-button"]`)
        if (submitButton) {
            await submitButton.click();
            await BrowserService.page.waitForNavigation({ waitUntil: "networkidle2" });
        }
    }

    // handle orientation page 
    let [orientationPageIndicator] = await BrowserService.page.$x(`//*[@data-testid="orientation-radio-selector"]`);
    if (orientationPageIndicator) {
        // click submit
        await BrowserService.page.waitForXPath(`//*[@type="submit"]`);
        let [submitButton] = await BrowserService.page.$x(`//*[@type="submit"]`)
        if (submitButton) {
            await submitButton.click();
            await BrowserService.page.waitForNavigation({ waitUntil: "networkidle2" });
        }
    }

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
    let jobUrl = (await response.json()).jobUrl;
    await BrowserService.page.goto(jobUrl, { waitUntil: "networkidle2" });
    let benefits = await BrowserService.page.$x(`//*[text()="Benefits:"]/following-sibling::ul/li`);
    let benefitsTexts = [];
    for (const benefitElemHandler of benefits) {
        benefitsTexts.push(await BrowserService.page.evaluate(benefitElemHandler => benefitElemHandler.innerText, benefitElemHandler));
    }
    return benefitsTexts;


}
JobsServices.getJobFullDetails = async(jobId) => {
    let benefits = await JobsServices.getJobBenefits(jobId);

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

    const data = await response.json();
    let normalizedJob = await normalizeFullDetailedJob(data);

    //delete old job document
    await Job.findOneAndDelete({ job_id: jobId });
    //insert the new job document
    const jobToSave = new Job(normalizedJob);
    jobToSave.benefits = benefits;
    normalizedJob = await jobToSave.save();
    return normalizedJob;
}


JobsServices.downloadCookies = async() => {

    const cookies = await BrowserService.page.cookies();
    await fs.writeFile(path.join('cookies', 'cookies.json'), JSON.stringify(cookies, null, 2));
}


JobsServices.csrfToken = "bUW4RbPHjgJ2S9m577tFsW4FxkggWhan";
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
            "sec-ch-ua": "\"Chromium\";v=\"98\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"98\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-datadog-origin": "rum",
            "x-datadog-parent-id": "803278832719911147",
            "x-datadog-sampled": "1",
            "x-datadog-sampling-priority": "1",
            "x-datadog-trace-id": "3401735100983902306",
            "x-indeed-rpc": "1",
            "cookie": JobsServices.cookie,
            "Referer": "https://employers.indeed.com/jobs?page=1&pageSize=50&tab=0&field=DATECREATED&dir=DESC&status=open%2Cpaused",
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

JobsServices.fillIn_RolesLocation = async(location) => {
    let city = location.city;
    let state = location.state;
    //click on one location option
    await BrowserService.page.waitForXPath(`//*[@value="ONE_LOCATION"]/parent::label`);
    let [oneLocation] = await BrowserService.page.$x(`//*[@value="ONE_LOCATION"]/parent::label`);
    await oneLocation.click();
    await BrowserService.page.waitForTimeout(2 * 1000);
    [oneLocation] = await BrowserService.page.$x(`//*[@value="ONE_LOCATION"]/parent::label`);
    await oneLocation.click();
    //click dont include the address option
    await BrowserService.page.waitForXPath(`//*[contains(@id,"workLocationType-OneMileRadius")]`);
    let [hideExactLocation] = await BrowserService.page.$x(`//*[contains(@id,"workLocationType-OneMileRadius")]`);
    await hideExactLocation.click();
    //fill in the city 
    await BrowserService.page.waitForXPath(`//*[@data-testid="precise-address-city"]`);
    let [cityInput] = await BrowserService.page.$x(`//*[@data-testid="precise-address-city"]`);
    //type
    await BrowserService.page.waitForTimeout(2 * 1000);
    await cityInput.click();
    await BrowserService.page.waitForTimeout(2 * 1000);
    await BrowserService.page.select(`[data-testid="precise-address-administrative-area-select"]`, state);
    for (let index = 0; index < 30; index++) {
        await cityInput.press("Backspace");
    }

    await cityInput.type(city + ', ' + state, { delay: 80 });
    await BrowserService.page.waitForTimeout(12000);
    await BrowserService.page.keyboard.press('ArrowDown');
    await BrowserService.page.waitForTimeout(4000);
    await BrowserService.page.keyboard.press('Enter');

    await BrowserService.page.waitForXPath(`//*[@data-testid="precise-map"]`);
    await BrowserService.page.waitForTimeout(4000);
}

JobsServices.clickSaveAndContinue = async() => {
    [saveAndContinue1] = await BrowserService.page.$x(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'save and continue')]`);
    [saveAndContinue2] = await BrowserService.page.$x(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'continue')]`);

    if (saveAndContinue1) {
        await saveAndContinue1.click({ clickCount: 3 });
    } else if (saveAndContinue2) {
        await saveAndContinue2.click({ clickCount: 3 });
    }
    await BrowserService.page.waitForTimeout(100);
    //second retry
    try {
        if (saveAndContinue1) {
            await saveAndContinue1.click({ clickCount: 3 });
        } else if (saveAndContinue2) {
            await saveAndContinue2.click({ clickCount: 3 });
        }
    } catch (error) {

    }
    await BrowserService.page.waitForTimeout(3000);

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


JobsServices.fillIn_schedule = async() => {
    await BrowserService.page.waitForXPath(`//span[contains(text(),"more")]/parent::button`);
    let [moreButton] = await BrowserService.page.$x(`//span[contains(text(),"more")]/parent::button`);
    await moreButton.click();
    await BrowserService.page.waitForXPath(`//*[@data-testid="job-schedule"]/following-sibling::label/div/div[text()="Other"]`);
    let [otherOption] = await BrowserService.page.$x(`//*[@data-testid="job-schedule"]/following-sibling::label/div/div[text()="Other"]`);
    await otherOption.click();
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
            break;
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
            break;

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
    await BrowserService.page.waitForXPath(`//span[contains(text(),"more")]/parent::button`);
    let [moreButton] = await BrowserService.page.$x(`//span[contains(text(),"more")]/parent::button`);
    if (moreButton)
        await moreButton.click();

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

JobsServices.fillIn_description = async(jobDescriptionHtml) => {
    //start filling the descritpion
    await BrowserService.page.waitForXPath(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'job description')]`);
    await BrowserService.page.$eval('#JobDescription-editor-editor-content', (el, jobDescriptionHtml) => { el.innerHTML = jobDescriptionHtml }, jobDescriptionHtml);
    //type space to apply changements
    let [descriptionInput] = await BrowserService.page.$x(`//*[@id="JobDescription-editor-editor-content"]`);
    await descriptionInput.click({ clickCount: 2 });

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

JobsServices.review_potential_matches = async() => {
    for (let index = 0; index < 3; index++) {
        await BrowserService.page.waitForXPath(`//*[text()='Maybe']/parent::button`);
        let [maybeButton] = await BrowserService.page.$x(`//*[text()='Maybe']/parent::button`);
        await maybeButton.click();
        await BrowserService.page.waitForTimeout(2000);
    }
}
JobsServices.skip_qualifications = async() => {
    await BrowserService.page.waitForXPath(`//*[text()='skip']/parent::button`);
    let [skipButton] = await BrowserService.page.$x(`//*[text()='skip']/parent::button`);
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
    let [endDateInput] = await BrowserService.page.$x(`//*[@id="input"]`);
    await endDateInput.click({ clickCount: 3 });
    await BrowserService.page.keyboard.type(newEndDate)
        //second time
    for (let index = 0; index < 30; index++) {
        await endDateInput.press('Backspace');
    }
    await BrowserService.page.keyboard.type(newEndDate)
        //third time
    for (let index = 0; index < 30; index++) {
        await endDateInput.press('Backspace');
    }
    await BrowserService.page.keyboard.type(newEndDate)

    //fourth time
    await BrowserService.page.evaluate((newEndDate) => {
        document.querySelector(`#input`).value = newEndDate;
    }, newEndDate);

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
    await BrowserService.page.waitForXPath(`//*[contains(@name,"applyMethod.emails")]`);
    let [emailInput] = await BrowserService.page.$x(`//*[contains(@name,"applyMethod.emails")]`);
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