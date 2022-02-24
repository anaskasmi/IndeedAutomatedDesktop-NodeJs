const { normalizeJobs } = require('../utilities/normalizeJobs');
const { normalizeFullDetailedJob } = require('../utilities/normalizeFullDetailedJob');
const { findRangeType } = require('../utilities/findRangeType');
const Moment = require('moment');
const axios = require('axios');
const path = require('path');
const fetch = require('node-fetch');

//models
const Job = require('./../models/Job')
const BrowserService = require('./BrowserService');
const Helpers = require('../utilities/Helpers');


let JobsServices = {};



JobsServices.openPostJobPage = async() => {

    await BrowserService.page.goto(`https://employers.indeed.com/j?from=gnav-empcenter#jobs`);
    await BrowserService.page.waitForXPath(`//*[@data-testid="header-post-job"]`);

    let [startNewJobButton] = await BrowserService.page.$x(`//*[@data-testid="header-post-job"]`);
    await startNewJobButton.click();
    await BrowserService.page.waitForNavigation({ waitUntil: "networkidle2" });


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

JobsServices.getJobFullDetails = async(jobId) => {


    let response = await fetch(`https://employers.indeed.com/p/post-job/edit-job?id=${jobId}`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "sec-ch-ua": "\"Chromium\";v=\"98\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"98\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-datadog-origin": "rum",
            "x-datadog-parent-id": "1573714256264127237",
            "x-datadog-sampled": "1",
            "x-datadog-sampling-priority": "1",
            "x-datadog-trace-id": "4834355297958519855",
            "x-indeed-api": "1",
            "x-indeed-appname": "jobs",
            "x-indeed-apptype": "desktop",
            "x-indeed-rpc": "1",
            "x-indeed-tk": "1fsmsvc51gvj9800",
            "x-indeed-v": "fc6dfab357c1",
            "cookie": "PCA=d71582ec4597e44c; ENC_CSRF=FZ28ZsZgL9YVB19O3cdGNyz1L8WB4OqQ; SHOE=\"SqK8kBnRzeUS1sU--H1Dj4KgkBZYEQhdWESMecOgHbqMpQZf2G55lVEUsstMux57kkQxH4npLWVnQCcGI5r3CukZKcM9cOJG2V7W8PKdVOqSfVLgHXyBLlHxISlwxGxUiw0AfisPWco=\"; __ssid=9a246326ee1c8eb163b789c953dd971; _ga=GA1.2.2074404572.1628624164; CSRF=YKGiLse8FqgRtGzotYeVVrLOXKBH0EXx; SOCK=\"R5k9sLaUHmqUCY8-pcnmH75RN54=\"; SURF=St2AaCFM7FQQMCc8sDRD7NiaoGLEexE9; indeed_rcc=CTK; CTK=1fsmst2l4nbcp801; ADOC=2078510905073534; _gcl_au=1.1.533538122.1645740998; DRAWSTK=505aefd543b9769f; PPID=eyJraWQiOiJmNmJkN2U4Zi02MmQyLTQ5ZDAtOTA1ZS1kNjVhMTBlOTVhZjIiLCJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJzdWIiOiJhY2QzZmJiYWU1ZmFiNjE2IiwiYXVkIjoiYzFhYjhmMDRmIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImNyZWF0ZWQiOjE2MDAxMDY0NDMwMDAsInJlbV9tZSI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL3NlY3VyZS5pbmRlZWQuY29tIiwiZXhwIjoxNjQ1NzQyNzkwLCJpYXQiOjE2NDU3NDA5OTAsImxvZ190cyI6MTYyODYyNDE5ODIxMCwiZW1haWwiOiJhbmFzQGthc21pLmRldiJ9.0hJOu3gCRGpCUXoY0rdCJP-_j4EwddA6pyd1KmKmUSBTt38IG_3czQRMgJ-UeE_hIyLWcvYV51CfxGlK--9fXA; INDEEDADS_HOME=6de620f32496e51e|draw; ADV=1; _ga=GA1.3.2074404572.1628624164; _gid=GA1.3.152010480.1645741000; _clck=15fp4tx|1|ez9|0; LC=co=US&hl=en; mhit=2078510905073534; _uetsid=7062f16095bf11ecac83199edea1b822; _uetvid=7063171095bf11ec8b06cdd0e0f8434e; JSESSIONID=node010465lz77x4ghv2b0wcc9onem164537.node0; _clsk=mqwesz|1645741091446|3|1|j.clarity.ms/collect; _mkto_trk=id:699-SXJ-715&token:_mch-indeed.com-1645741106785-97259; __pdst=fa7ed747306141afb743c977e246cf8f; _gat_UA-90780-1=1; _dd_s=rum=1&id=3778e39a-ba96-409d-944c-042c147d5048&created=1645740996208&expire=1645742065440",
            "Referer": "https://employers.indeed.com/p",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    });
    if (response.status != 200) {
        throw Error('cant getJobFullDetails !');
    }
    let unormalizedJobFromJobEditPage = await response.json();

    let normalizedJob = await normalizeFullDetailedJob(unormalizedJobFromJobEditPage);
    //delete old job document
    await Job.findOneAndDelete({ job_id: jobId });
    //insert the new job document
    const jobToSave = new Job(normalizedJob);
    await jobToSave.save();
    return normalizedJob;
}


JobsServices.downloadCookies = async() => {
    const cookies = await BrowserService.page.cookies();
    await fs.writeFile(path.join('cookies', 'cookies.json'), JSON.stringify(cookies, null, 2));
}


JobsServices.csrfToken = null;
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
            "cookie": "PCA=d71582ec4597e44c; ENC_CSRF=FZ28ZsZgL9YVB19O3cdGNyz1L8WB4OqQ; SHOE=\"SqK8kBnRzeUS1sU--H1Dj4KgkBZYEQhdWESMecOgHbqMpQZf2G55lVEUsstMux57kkQxH4npLWVnQCcGI5r3CukZKcM9cOJG2V7W8PKdVOqSfVLgHXyBLlHxISlwxGxUiw0AfisPWco=\"; __ssid=9a246326ee1c8eb163b789c953dd971; _ga=GA1.2.2074404572.1628624164; CSRF=YKGiLse8FqgRtGzotYeVVrLOXKBH0EXx; SOCK=\"R5k9sLaUHmqUCY8-pcnmH75RN54=\"; SURF=St2AaCFM7FQQMCc8sDRD7NiaoGLEexE9; indeed_rcc=CTK; CTK=1fskali73q63u801; ADOC=2078510905073534; _gcl_au=1.1.838815195.1645654766; _ga=GA1.3.2074404572.1628624164; _gid=GA1.3.1686099092.1645654767; DRAWSTK=6c2bd346d9f65214; PPID=eyJraWQiOiJmNmJkN2U4Zi02MmQyLTQ5ZDAtOTA1ZS1kNjVhMTBlOTVhZjIiLCJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJzdWIiOiJhY2QzZmJiYWU1ZmFiNjE2IiwiYXVkIjoiYzFhYjhmMDRmIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImNyZWF0ZWQiOjE2MDAxMDY0NDMwMDAsInJlbV9tZSI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL3NlY3VyZS5pbmRlZWQuY29tIiwiZXhwIjoxNjQ1NjU2NTYwLCJpYXQiOjE2NDU2NTQ3NjAsImxvZ190cyI6MTYyODYyNDE5ODIxMCwiZW1haWwiOiJhbmFzQGthc21pLmRldiJ9.UBKmZb4d8dNatv7_EOoql0k_BN9aTj6KHC0pOJ7FRcp7G36G_3rVR5YTbespOF1IgQfzPucy_bf-ZdN1djLULg; INDEEDADS_HOME=6de620f32496e51e|draw; ADV=1; _clck=1jtdte3|1|ez8|0; mhit=2078510905073534; _gat_ga_tracker=1; _gat_UA-90780-1=1; _dd_s=rum=1&id=2c755c7a-ef7d-4059-bae2-ed4b29d70dbb&created=1645654764495&expire=1645656092353; _uetsid=aa0b35e094f611ec862fe181995ff0b3; _uetvid=aa0b693094f611ecb67c61d317bd5f5c; JSESSIONID=node0hq5hyfcebmza138wirfq9saei46180.node0; _clsk=pa3eff|1645655199926|8|0|h.clarity.ms/collect",
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
    await BrowserService.page.waitForXPath(`//*[contains(text(),'Company name:')]/following-sibling::button`);
    let [companyNamePencil] = await BrowserService.page.$x(`//*[contains(text(),'Company name:')]/following-sibling::button`);
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
    for (let index = 0; index < 30; index++) {
        await cityInput.press("Backspace");
    }
    await cityInput.type(city + ', ' + state, { delay: 20 });
    await BrowserService.page.waitForTimeout(3000);
    await BrowserService.page.keyboard.press('ArrowDown');
    await BrowserService.page.keyboard.press('Enter');



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
    await BrowserService.page.waitForXPath(`//*[text()='What is the schedule for this job?']/following-sibling::button`);
    let [scheduleFieldset] = await BrowserService.page.$x(`//*[text()='What is the schedule for this job?']/following-sibling::button`);
    await scheduleFieldset.click();

    await BrowserService.page.waitForXPath(`//span[text()='Other']`);
    let [otherOption] = await BrowserService.page.$x(`//span[text()='Other']`);
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
        let jobSalaryRangeType = await BrowserService.page.$(`[name="remote.draftJobPosts.attributes.salaryRangeType"]`);
        if (jobSalaryRangeType) {
            await BrowserService.page.select(`[name="remote.draftJobPosts.attributes.salaryRangeType"]`, jobDetails_salaryRangeType)
            return true;
        }
    } else if (jobDetails_SalaryFrom && jobDetails_SalaryTo) {
        jobDetails_salaryRangeType = findRangeType(jobDetails_SalaryFrom, jobDetails_SalaryTo)
        let jobSalaryRangeType = await BrowserService.page.$(`[name="remote.draftJobPosts.attributes.salaryRangeType"]`);
        if (jobSalaryRangeType) {
            await BrowserService.page.select(`[name="remote.draftJobPosts.attributes.salaryRangeType"]`, jobDetails_salaryRangeType)
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

            break;

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
    await BrowserService.page.waitForXPath(`//*[contains(@name,"resumeRequired")]`);
    let [resumeRequiredButton] = await BrowserService.page.$x(`//*[contains(@name,"resumeRequired")]`);
    await resumeRequiredButton.click();
    return true;
}

JobsServices.click_confirm = async() => {
    await BrowserService.page.waitForXPath(`//*[text()='Confirm']/parent::button`);
    let [confirmButton] = await BrowserService.page.$x(`//*[text()='Confirm']/parent::button`);
    await confirmButton.click();
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
            "cookie": "PCA=d71582ec4597e44c; ENC_CSRF=FZ28ZsZgL9YVB19O3cdGNyz1L8WB4OqQ; SHOE=\"SqK8kBnRzeUS1sU--H1Dj4KgkBZYEQhdWESMecOgHbqMpQZf2G55lVEUsstMux57kkQxH4npLWVnQCcGI5r3CukZKcM9cOJG2V7W8PKdVOqSfVLgHXyBLlHxISlwxGxUiw0AfisPWco=\"; __ssid=9a246326ee1c8eb163b789c953dd971; _ga=GA1.2.2074404572.1628624164; CSRF=YKGiLse8FqgRtGzotYeVVrLOXKBH0EXx; SOCK=\"R5k9sLaUHmqUCY8-pcnmH75RN54=\"; SURF=St2AaCFM7FQQMCc8sDRD7NiaoGLEexE9; indeed_rcc=CTK; CTK=1fsk8l3f1n02p801; ADOC=2078510905073534; _gcl_au=1.1.1100063608.1645652659; DRAWSTK=939f06d710b327e7; PPID=eyJraWQiOiJmNmJkN2U4Zi02MmQyLTQ5ZDAtOTA1ZS1kNjVhMTBlOTVhZjIiLCJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJzdWIiOiJhY2QzZmJiYWU1ZmFiNjE2IiwiYXVkIjoiYzFhYjhmMDRmIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImNyZWF0ZWQiOjE2MDAxMDY0NDMwMDAsInJlbV9tZSI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL3NlY3VyZS5pbmRlZWQuY29tIiwiZXhwIjoxNjQ1NjU0NDU0LCJpYXQiOjE2NDU2NTI2NTQsImxvZ190cyI6MTYyODYyNDE5ODIxMCwiZW1haWwiOiJhbmFzQGthc21pLmRldiJ9.WdjbJFnw70QzwZ0Xk1Ay-gCQX1zhs6GWjgwzJKbVjI3h-dhtQcwo_tyjp5c00Y77TV2hM-2j6gKaYmyX3aLB2g; INDEEDADS_HOME=6de620f32496e51e|draw; ADV=1; _ga=GA1.3.2074404572.1628624164; _gid=GA1.3.973980.1645652662; _clck=1imcv9h|1|ez8|0; mhit=2078510905073534; _uetsid=c2d38c6094f111ecaffbb978dbcd33ec; _uetvid=c2d3a5d094f111ec86d8d199e200fca9; JSESSIONID=node01pyo1xm3k8z4r1f8aks9yv7a2d39554.node0; _clsk=1503hje|1645653273605|6|0|e.clarity.ms/collect; _dd_s=rum=1&id=86e0ace2-aeae-4144-9d40-df6220fa0069&created=1645652657368&expire=1645654183030; _gali=job-status-input-5719373",
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