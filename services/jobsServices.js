const { normalizeJobs } = require('../utilities/normalizeJobs');
const { normalizeFullDetailedJob } = require('../utilities/normalizeFullDetailedJob');
const { findRangeType } = require('../utilities/findRangeType');
const Moment = require('moment');
const axios = require('axios');
const path = require('path');

//models
const Job = require('./../models/Job')
const BrowserService = require('./BrowserService');
const Helpers = require('../utilities/Helpers');


let JobsServices = {};



JobsServices.openPostJobPage = async() => {
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job`, { waitUntil: "networkidle2" });
    let [skipButton] = await BrowserService.page.$x(`//*[@data-tn-element="navControlButton-skip"]`);
    if (skipButton) {
        console.log('found skip button')
        await skipButton.click();
    }
}

JobsServices.getJobFullDetails = async(jobId) => {
    let unormalizedJobFromJobEditPage;
    let unormalizedJobFromJobShowPage;
    BrowserService.page.on('response', function getDetailsFromJobPage(response) {
        if (response.url().includes('https://employers.indeed.com/p/post-job/edit-job?id=')) {
            response.json().then((res) => {
                if (res) {
                    unormalizedJobFromJobEditPage = res;
                }

            })
        }
    });
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/edit-job?id=${jobId}`, { waitUntil: 'load' });
    await BrowserService.page.waitForXPath(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'getting started')]`);

    //get missing details from the job page
    BrowserService.page.on('response', function getDetailsFromHomePage(response) {
        if (response.url().includes('employers.indeed.com/j/jobs/view?id=')) {
            response.json().then((res) => {
                if (res.job) {
                    unormalizedJobFromJobShowPage = res.job;
                }

            })
        }
    });
    await BrowserService.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobId}`, { waitUntil: 'load' });
    await BrowserService.page.waitForXPath(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'job description')]`);

    //second retry
    if (!unormalizedJobFromJobShowPage) {
        console.log('unormalizedJobFromJobShowPage not found retry...')
        await BrowserService.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobId}`, { waitUntil: 'load' });
        await BrowserService.page.waitForXPath(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'job description')]`);
    }
    if (!unormalizedJobFromJobEditPage) {
        console.log('unormalizedJobFromJobEditPage not found retrying ...')
        await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/edit-job?id=${jobId}`, { waitUntil: 'load' });
        await BrowserService.page.waitForXPath(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'getting started')]`);
    }
    //normalize job
    let normalizedJob = await normalizeFullDetailedJob(unormalizedJobFromJobEditPage, unormalizedJobFromJobShowPage);
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


JobsServices.scrapAllJobs = async(totalPagesNumber = 6) => {
    //delete old jobs
    await Job.deleteMany({});

    const jobsArray = [];

    function getJobsFromReponse(response) {
        if (response.url().includes('graphql')) {
            response.json().then(async(res) => {
                if (res.data.jobs) {
                    for (const job of res.data.jobs) {
                        jobsArray.push(job);
                    }
                    console.log('Total jobs found : ' + jobsArray.length + ' jobs')
                }
            })
        }
    }
    BrowserService.page.on('response', getJobsFromReponse);

    console.log('regrabing jobs from Indeed..')
    for (let currentPage = 1; currentPage <= totalPagesNumber; currentPage++) {
        console.log('page : ' + currentPage)
        await BrowserService.page.goto(`https://employers.indeed.com/j#jobs?p=${currentPage}`);
        // if (!(await BrowserService.page.url()).includes('j#vr-onboarding')) {
        //     console.log('jobs page redirected.. trying again..')
        //     await BrowserService.page.reload();
        //     await BrowserService.page.goto(`https://employers.indeed.com/j#jobs?p=${currentPage}`);
        // }
        await BrowserService.page.waitForXPath(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'open')]`);

    }
    BrowserService.page.removeListener('response', getJobsFromReponse);
    let normalizedJobs = await normalizeJobs(jobsArray);
    await Job.insertMany(normalizedJobs);



}


JobsServices.getAllJobsFromDb = async() => {
    let jobs = await Job.find();
    return jobs

}

JobsServices.getJobDataFromDb = async(jobId) => {
    let job = await Job.findOne({
        job_id: jobId,
    });
    return job

}

JobsServices.unlockCompanyNameInput = async() => {
    //click pencil Icon
    id = "companyNameChangeRadioButtonPostingOnBehalf"
    await BrowserService.page.waitForXPath(`//*[@id="change-company-link"]`);
    let [companyNamePencil] = await BrowserService.page.$x(`//*[@id="change-company-link"]`);
    if (companyNamePencil) {
        await companyNamePencil.click();
    }

    //chose company name change reason
    await BrowserService.page.waitForXPath(`//*[@for="companyNameChangeRadioButtonPostingOnBehalf"]`);
    let [companyNameChangeReason] = await BrowserService.page.$x(`//*[@for="companyNameChangeRadioButtonPostingOnBehalf"]`);
    await companyNameChangeReason.click();
}

JobsServices.fillIn_CompanyName = async(companyName) => {
    let [companyEditLock] = await BrowserService.page.$x(`//*[@data-tn-element="changeCompanyLink"]`);
    if (companyEditLock) {
        await companyEditLock.click();
        //chose company name change reason
        await BrowserService.page.waitForXPath(`//*[@for="companyNameChangeRadioButtonPostingOnBehalf"]`);
        let [companyNameChangeReason] = await BrowserService.page.$x(`//*[@for="companyNameChangeRadioButtonPostingOnBehalf"]`);
        await companyNameChangeReason.click();

    }
    await BrowserService.page.waitForXPath(`//*[@id="input-company"]`);
    let [JobCompanyNameInput] = await BrowserService.page.$x(`//*[@id="input-company"]`);

    if (process.env.TYPING_METHODE == "keyboard") {
        await JobCompanyNameInput.click({ clickCount: 3 });
        await JobCompanyNameInput.press('Backspace');
        await JobCompanyNameInput.type(companyName);
    } else {
        await BrowserService.page.evaluate((companyName) => {
            document.querySelector(`#input-company`).value = companyName;
        }, companyName);
        await BrowserService.page.evaluate((companyName) => {
            document.querySelector(`#input-company`).value = companyName;
        }, companyName);
        await JobCompanyNameInput.type(' ');
        await BrowserService.page.waitForTimeout(1000);
        await JobCompanyNameInput.press('Enter');
    }


}

JobsServices.fillIn_JobTitle = async(jobTitle) => {
    await BrowserService.page.waitForXPath(`//*[@id="JobTitle"]`);
    let [jobTitleInput] = await BrowserService.page.$x(`//*[@id="JobTitle"]`);
    //writing using the keyboard methode
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
    await BrowserService.page.waitForXPath(`//*[@for="roleLocationTypeRadiosOneLocation"]`);
    let [oneLocation] = await BrowserService.page.$x(`//*[@for="roleLocationTypeRadiosOneLocation"]`);
    await oneLocation.click();
    //click dont include the address option
    await BrowserService.page.waitForXPath(`//*[@id="ecl-RadioItem-label-HideExactLocation"]`);
    let [hideExactLocation] = await BrowserService.page.$x(`//*[@id="ecl-RadioItem-label-HideExactLocation"]`);
    await hideExactLocation.click();
    //fill in the city 
    await BrowserService.page.waitForXPath(`//*[@id="precise-address-city-input"]`);
    let [cityInput] = await BrowserService.page.$x(`//*[@id="precise-address-city-input"]`);

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
    // fill in the state
    await BrowserService.page.select('[name="region"]', state)

    //wait for Advertising location to apply 
    await BrowserService.page.waitForTimeout(3 * 1000);



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
    await BrowserService.page.waitForXPath(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'other')]/parent::label`);
    let [otherScheduleOption] = await BrowserService.page.$x(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'other')]/parent::label`);
    await otherScheduleOption.click();
}

JobsServices.fillIn_hiresNumber = async(jobDetails_intHiresNeeded) => {
    if (jobDetails_intHiresNeeded > 0 && jobDetails_intHiresNeeded <= 10) {
        await BrowserService.page.select(`#intHiresNeeded`, jobDetails_intHiresNeeded)
    } else if (jobDetails_intHiresNeeded > 10) {
        await BrowserService.page.select(`#intHiresNeeded`, 'TEN_PLUS')
    } else {
        await BrowserService.page.select(`#intHiresNeeded`, 'RECURRING_HIRE')
    }
}

JobsServices.fillIn_deadline = async(jobDetails_expectedHireDate) => {
    await BrowserService.page.select(`#expectedHireDate`, jobDetails_expectedHireDate)
}

JobsServices.fillIn_paymentType = async(jobDetails_salaryRangeType, jobDetails_SalaryFrom, jobDetails_SalaryTo) => {
    //find the salary Range Type
    if (jobDetails_salaryRangeType) {
        let [jobSalaryRangeType] = await BrowserService.page.$x(`//*[@id="JobSalaryRangeType"]`);
        if (jobSalaryRangeType) {
            await BrowserService.page.select(`[name="jobsalaryrangetype"]`, jobDetails_salaryRangeType)
            return true;
        }
    } else if (jobDetails_SalaryFrom && jobDetails_SalaryTo) {
        jobDetails_salaryRangeType = findRangeType(jobDetails_SalaryFrom, jobDetails_SalaryTo)
        let [jobSalaryRangeType] = await BrowserService.page.$x(`//*[@id="JobSalaryRangeType"]`);
        if (jobSalaryRangeType) {
            await BrowserService.page.select(`#JobSalaryRangeType`, jobDetails_salaryRangeType)
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
            [jobSalary1] = await BrowserService.page.$x(`//*[@id="JobSalary1"]`);
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
            [jobSalary1] = await BrowserService.page.$x(`//*[@id="JobSalary1"]`);
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
            [jobSalary1] = await BrowserService.page.$x(`//*[@id="JobSalary1"]`);
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
            [jobSalary1] = await BrowserService.page.$x(`//*[@id="JobSalary1"]`);
            [jobSalary2] = await BrowserService.page.$x(`//*[@id="JobSalary2"]`);
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
    let [jobSalary1] = await BrowserService.page.$x(`//*[@id="JobSalary1"]`);
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
        [jobSalaryInput] = await BrowserService.page.$x(`//*[@id="JobSalary1"]`);
    } else {
        [jobSalaryInput] = await BrowserService.page.$x(`//*[@id="JobSalary2"]`);
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
    let [jobSalaryPeriod] = await BrowserService.page.$x(`//*[@id="JobSalaryPeriod"]`);
    if (jobSalaryPeriod && jobDetails_SalaryPer) {
        await BrowserService.page.select(`[name="jobsalaryperiod"]`, jobDetails_SalaryPer)
        return true;
    } else {
        return false;
    }
}

JobsServices.fillIn_description = async(jobDescriptionHtml) => {
    // split description to array 
    // let descriptionArray = descriptionToArray(jobDescriptionHtml);

    //start filling the descritpion
    await BrowserService.page.waitForXPath(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'job description')]`);
    await BrowserService.page.$eval('#JobDescription-editor-content', (el, jobDescriptionHtml) => { el.innerHTML = jobDescriptionHtml }, jobDescriptionHtml);

    //type space to apply changements
    let [descriptionInput] = await BrowserService.page.$x(`//*[@id="JobDescription-editor-content"]`);
    await descriptionInput.type(' ')

}


JobsServices.fillIn_isResumeRequired = async() => {
    await BrowserService.page.waitForXPath(`//*[@id="radio-applicationemailresumerequirement-REQUIRED"]`);
    let [resumeRequiredButton] = await BrowserService.page.$x(`//*[@id="radio-applicationemailresumerequirement-REQUIRED"]`);
    await resumeRequiredButton.click();
    return true;
}

JobsServices.click_confirm = async() => {
    await BrowserService.page.waitForXPath(`//*[@data-tn-element="sheet-next-button"]`);
    let [confirmButton] = await BrowserService.page.$x(`//*[@data-tn-element="sheet-next-button"]`);
    await confirmButton.click();
}

JobsServices.click_advanced = async() => {
    await BrowserService.page.waitForXPath(`//*[@id="ADVANCED"]`);
    let [budgetAdvancedButton] = await BrowserService.page.$x(`//*[@id="ADVANCED"]`);
    await budgetAdvancedButton.click();
}

JobsServices.fillIn_adDurationType = async() => {
    await BrowserService.page.waitForXPath(`//*[@name="jobDurationSelector"]`);
    await BrowserService.page.select(`[name="jobDurationSelector"]`, "CUSTOM_END_DATE");
}

JobsServices.fillIn_adDurationDate = async(endDateIncreaseNumber) => {

    //generate new date after 4 days
    let newEndDate = Moment(Moment()).add(+endDateIncreaseNumber, 'days');
    console.log(`newEndDate + ${endDateIncreaseNumber} days : ${newEndDate}`);

    // change its Format
    newEndDate = newEndDate.format('MM/DD/YYYY');
    console.log('newEndDate + format : ' + newEndDate);

    //fill in the input
    let [endDateInput] = await BrowserService.page.$x(`//*[@id="endDateContainer-0"]/input`);
    await endDateInput.click({ clickCount: 3 });
    for (let index = 0; index < 30; index++) {
        await endDateInput.press('Backspace');
    }
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
        document.querySelector(`#endDateContainer-0 > input[type=text]`).value = newEndDate;
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
    await BrowserService.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobId}`, { waitUntil: 'load' });
    await BrowserService.page.waitForTimeout(2000);
    if (!(await BrowserService.page.url()).includes('jobs/view?id=')) {
        console.log('Closing job redirected.. trying again..')
        await BrowserService.page.reload();
        await BrowserService.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobId}`, { waitUntil: 'load' });
    }



    //open status bar
    await BrowserService.page.waitForXPath(`//*[@id="sidebarStatusButton"]`);
    let [jobStatusMenu] = await BrowserService.page.$x(`//*[@id="sidebarStatusButton"]`);
    await jobStatusMenu.click();

    // click close
    await BrowserService.page.waitForXPath(`//*[@data-valuetext="Close job"]`);
    let [closeOption] = await BrowserService.page.$x(`//*[@data-valuetext="Close job"]`);
    await closeOption.click();


    // click I didnt hire anyone
    await BrowserService.page.waitForXPath(`//*[@data-tn-element="noHire-radio"]/parent::label`);
    let [IDidntHireChoice] = await BrowserService.page.$x(`//*[@data-tn-element="noHire-radio"]/parent::label`);
    await IDidntHireChoice.click();


    //click continue
    await BrowserService.page.waitForXPath(`//*[@data-tn-element="continue-button"]`);
    let [continueCloseButton] = await BrowserService.page.$x(`//*[@data-tn-element="continue-button"]`)
    await continueCloseButton.click();

    //click other
    await BrowserService.page.waitForXPath(`//*[@data-tn-element="other-checkbox"]/parent::label`);
    let [otherButton] = await BrowserService.page.$x(`//*[@data-tn-element="other-checkbox"]/parent::label`);
    await otherButton.click();

    // click submit
    await BrowserService.page.waitForXPath(`//*[@data-tn-element="submit-button"]`);
    let [submitButton] = await BrowserService.page.$x(`//*[@data-tn-element="submit-button"]`)
    await submitButton.click();

    await BrowserService.page.waitForTimeout(2000);

}

JobsServices.fillIn_email = async(jobDetails_emails) => {
    await BrowserService.page.waitForXPath(`//*[@name="communication-settings-email-input_primary"]`);
    let [emailInput] = await BrowserService.page.$x(`//*[@name="communication-settings-email-input_primary"]`);
    await emailInput.click({ clickCount: 3 });
    await emailInput.press('Backspace');
    await Helpers.clearInput();
    await emailInput.type(jobDetails_emails);
    // if (process.env.TYPING_METHODE == "keyboard") {
    //     await emailInput.click({ clickCount: 3 });
    //     await emailInput.press('Backspace');
    //     await emailInput.type(jobDetails_emails);
    // } else {
    //     await emailInput.type(' ');
    //     await emailInput.press('Backspace');
    //     await BrowserService.page.evaluate((jobDetails_emails) => {
    //         document.querySelector(`[name="communication-settings-email-input_primary"]`).value = jobDetails_emails;
    //     }, jobDetails_emails);
    //     await BrowserService.page.evaluate((jobDetails_emails) => {
    //         document.querySelector(`[name="communication-settings-email-input_primary"]`).value = jobDetails_emails;
    //     }, jobDetails_emails);
    //     await emailInput.press('Enter');
    // }

}

JobsServices.close_questions = async() => {
    // await BrowserService.page.waitForXPath(`//*[@aria-label="Remove question"]`);
    await BrowserService.page.waitForTimeout(2000);
    let xButtons = await BrowserService.page.$x(`//*[@aria-label="Remove question"]`);
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