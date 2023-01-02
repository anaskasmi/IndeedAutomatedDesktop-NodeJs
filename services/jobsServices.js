const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const Moment = require('moment');
const { GraphQLClient, gql } = require('graphql-request')
const { normalizeJobs } = require('../utilities/normalizeJobs');
const { normalizeFullDetailedJob } = require('../utilities/normalizeFullDetailedJob');
const { findRangeType } = require('../utilities/findRangeType');
const headers = require('./graphQl/headers/headers');
const saveDraftJobPost = require('./graphQl/mutations/saveDraftJobPost');
const SetBudgetMutation = require('./graphQl/mutations/SetBudget.js');
const draftJobPostFields = require('./graphQl/fragments/draftJobPostFields');

//models
const Job = require('./../models/Job')
const BrowserService = require('./BrowserService');
const Helpers = require('../utilities/Helpers');
let JobsServices = {};

JobsServices.openPostJobPage = async() => {
    await BrowserService.page.evaluate(() => window.stop());
    await BrowserService.page.goto(`https://employers.indeed.com/o/p`, { waitUntil: "networkidle2" });

    // skip hire survey
    if ((await BrowserService.page.url()).includes('hire-survey')) {
        await BrowserService.page.waitForTimeout(2 * 1000);
        let [noOption] = await BrowserService.page.$x(`//*[@value="no"]/parent::label`);
        if (noOption) {
            await noOption.click();
            await BrowserService.page.waitForTimeout(1000);
            let [otherOption] = await BrowserService.page.$x(`//*[@name="other"]/parent::label`);
            if (otherOption) {
                await otherOption.click();
                let [continueButton] = await BrowserService.page.$x(`//*[@type="submit"]`);
                await continueButton.click();
            }
        }
    }

    // chose new job posting
    await BrowserService.page.waitForTimeout(2 * 1000);
    let [newJobPostingOption] = await BrowserService.page.$x(`//*[@data-testid="JOBPOSTING_STARTNEW"]/parent::label`);
    if (newJobPostingOption) {
        await newJobPostingOption.click();
        let [continueButton] = await BrowserService.page.$x(`//*[@type="submit"]`);
        await continueButton.click();
    }

    //reset filled values
    await BrowserService.page.waitForTimeout(2 * 1000);
    let [resetButton] = await BrowserService.page.$x(`//*[text()='Reset']/parent::button`);
    if (resetButton) {
        await resetButton.click();
    }


}

JobsServices.fetchJobDataByIDFromAPI = async(jobId) => {

    let response = await fetch(`https://employers.indeed.com/j/jobs/view?id=${jobId}&indeedcsrftoken=${JobsServices.csrfToken}`, {
        headers: {
            ...headers,
            "x-indeed-rpc": "1",
        }
    });

    return response.json();
}

JobsServices.getJobBenefits = async(jobId) => {
    let response = await fetch(`https://employers.indeed.com/j/jobs/view?id=${jobId}&indeedcsrftoken=${JobsServices.csrfToken}`, {
        "headers": {
            ...headers,
            "accept": "application/json",
            "indeed-client-application": "ic-jobs-management",
            "x-indeed-rpc": "1",
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
    let benefitsTexts = ['Other'];
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
        headers,
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
    await BrowserService.page.waitForTimeout(1 * 1000);
    // choose In person
    const [generalLocation] = await BrowserService.page.$x(`//*[contains(text(),'general location')]`);
    if (generalLocation) {
        await generalLocation.click();
    }


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
    let otherOptions = await BrowserService.page.$x(`//*[text()="Other"]`);
    if (otherOptions.length > 0) {
        for (const otherOption of otherOptions) {
            await otherOption.click();
        }
    } else {
        let noneOptions = await BrowserService.page.$x(`//*[text()="None"]`);
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
                break;
            } else {
                await jobSalary1.click({ clickCount: 3 });
                await jobSalary1.press('Backspace');
                break;
            }
            //fill in salary 1 with jobDetails_SalaryFrom
        case 'STARTING_AT':
        case 'EXACT_RATE':
            [jobSalary1] = await BrowserService.page.$x(`//*[@id="local.temp-salary.minimum"]`);
            if (jobDetails_SalaryFrom) {
                await jobSalary1.click({ clickCount: 3 });
                await jobSalary1.press('Backspace');
                await jobSalary1.type(jobDetails_SalaryFrom)
                break
            } else {
                await jobSalary1.click({ clickCount: 3 });
                await jobSalary1.press('Backspace');
                break
            }
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
            break
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
      ${draftJobPostFields}
      ${saveDraftJobPost}
    `;

    const variables = {
        "input": {
            "id": jobId,
            "patch": {
                "description": jobDescription.toString(),
            }
        }
    }

    const client = new GraphQLClient("https://apis.indeed.com/graphql?locale=en-US&co=US", {
        headers: {
            ...headers,
            "indeed-client-sub-app": "job-posting",
            "indeed-client-sub-app-component": "./JobDescriptionSheet",
        }
    })
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

JobsServices.fillIn_adDurationDate = async() => {

    //generate new date after X given days
    let newEndDate = Moment(Moment()).add(1, 'days');
    // change its Format
    newEndDate = newEndDate.format('MM/DD/YYYY');

    //fill in the input
    let [endDateInput] = await BrowserService.page.$x(`//*[@data-at="end-date-picker"]/div/div/div/span/input`);
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

JobsServices.fillIn_adBudget = async(budget) => {

    await BrowserService.page.select(`select#adEndDateSelect`, 'CUSTOM')

    let [budgetValueInput] = await BrowserService.page.$x(`//*[@id="budget"]`);
    if (budgetValueInput && budget) {

        // add budget value
        let budgetInDollar = Math.ceil(budget).toString();
        await budgetValueInput.click({ clickCount: 3 });
        await budgetValueInput.press('Backspace');
        await budgetValueInput.type(budgetInDollar);

        // second time : add budget value
        await BrowserService.page.waitForTimeout(1 * 1000);
        await budgetValueInput.click({ clickCount: 3 });
        await budgetValueInput.press('Backspace');
        await budgetValueInput.type(budgetInDollar);

        // add budget Period
        await BrowserService.page.select(`select#budgetPeriod`, "DAILY")

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
        headers: {
            ...headers,
            "content-type": "application/json",
            "x-indeed-rpc": "1",
            "indeed-client-application": "ic-jobs-management",
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
JobsServices.fillIn_otherBenefits = async() => {}

module.exports = JobsServices;