const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
const { normalizeJobs } = require('../utilities/normalizeJobs');
const { normalizeFullDetailedJob } = require('../utilities/normalizeFullDetailedJob');
const { findRangeType } = require('../utilities/findRangeType');
const { descriptionToArray } = require('../utilities/descriptionToArray');
const { loadCookies } = require('../utilities/loadCookies');
const Moment = require('moment');
const axios = require('axios');

const path = require('path');
//models
const Job = require('./../models/Job')

let browser = null;
let page = null;
let JobsServices = {};

//get new browser and set up its params
JobsServices.getNewBrowser = async() => {
    //allow only one browser and one page to be opened
    if (this.browser && (await this.browser.pages()).length > 0) {
        return;
    }

    // get new browser
    this.browser = await puppeteer.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-features=site-per-process',
            '--start-maximized',
            '--font-render-hinting=none',
            '--disable-gpu',
            '--proxy-server=' + process.env.PROXY_SERVER,
        ],
        // defaultViewport: null,
        executablePath: process.platform == "win32" ? process.env.CHROME_EXECUTABLE_PATH_WINDOWS : process.env.CHROME_EXECUTABLE_PATH_MAC

    });
    //when page created, set up the view port and the proxy 
    this.browser.on('targetcreated', async target => {
        if (target.type() === 'page') {
            const page = await target.page();
            await page.authenticate({
                username: process.env.PROXY_USERNAME,
                password: process.env.PROXY_PASSWORD,
            });
            await loadCookies(page);
        }
    })

    //get new page 
    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(2 * 60 * 1000);
    this.page.on('response', async(response) => {
        if (response.url().includes('no-dupe-posting')) {
            this.page.waitForTimeout(3000);
            let [thiIsADifferentJob] = await this.page.$x(`//*[@for="next-step-radio--continue"]`);
            if (thiIsADifferentJob) {
                await thiIsADifferentJob.click()
            }
            let [continueButton] = await this.page.$x(`//*[@data-tn-element="sorepost-next-step-continue-continue"]`);
            if (continueButton) {
                await continueButton.click()
                this.page.waitForTimeout(3000);
            }

        }
    });
    await this.page.goto('https://employers.indeed.com/');
}



//close browser
JobsServices.closeBrowser = async() => {
    try {
        this.browser.close();
    } catch (error) {
        console.log(error)
    }
}



JobsServices.openPostJobPage = async() => {
    await this.page.goto(`https://employers.indeed.com/p#post-job`)
}

JobsServices.getJobFullDetails = async(jobId) => {
    let unormalizedJobFromJobEditPage;
    let unormalizedJobFromJobShowPage;
    this.page.on('response', function getDetailsFromJobPage(response) {
        if (response.url().includes('https://employers.indeed.com/p/post-job/edit-job?id=')) {
            response.json().then((res) => {
                if (res) {
                    unormalizedJobFromJobEditPage = res;
                }

            })
        }
    });
    await this.page.goto(`https://employers.indeed.com/p#post-job/edit-job?id=${jobId}`, { waitUntil: 'load' });
    await this.page.waitForXPath(`//*[text()='Getting Started']`);

    //get missing details from the job page
    this.page.on('response', function getDetailsFromHomePage(response) {
        if (response.url().includes('employers.indeed.com/j/jobs/view?id=')) {
            response.json().then((res) => {
                if (res.job) {
                    unormalizedJobFromJobShowPage = res.job;
                }

            })
        }
    });
    await this.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobId}`, { waitUntil: 'load' });
    await this.page.waitForXPath(`//*[text()='Job Description']`);

    //second retry
    if (!unormalizedJobFromJobShowPage) {
        console.log('unormalizedJobFromJobShowPage not found retry...')
        await this.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobId}`, { waitUntil: 'load' });
        await this.page.waitForXPath(`//*[text()='Job Description']`);
    }
    if (!unormalizedJobFromJobEditPage) {
        console.log('unormalizedJobFromJobEditPage not found retrying ...')
        await this.page.goto(`https://employers.indeed.com/p#post-job/edit-job?id=${jobId}`, { waitUntil: 'load' });
        await this.page.waitForXPath(`//*[text()='Getting Started']`);

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
    const cookies = await this.page.cookies();
    await fs.writeFile(path.join('cookies', 'cookies.json'), JSON.stringify(cookies, null, 2));
}


JobsServices.scrapAllJobs = async(totalPagesNumber = 3) => {
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
                    console.log(jobsArray.length)
                }
            })
        }
    }
    this.page.on('response', getJobsFromReponse);

    for (let currentPage = 1; currentPage <= totalPagesNumber; currentPage++) {
        console.log('page : ' + currentPage)
        await this.page.goto(`https://employers.indeed.com/j#jobs?p=${currentPage}`);
        // await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
        await this.page.waitForXPath(`//*[contains(text(),'Open')]`)
    }
    this.page.removeListener('response', getJobsFromReponse);
    let normalizedJobs = await normalizeJobs(jobsArray);
    await Job.insertMany(normalizedJobs);



}


JobsServices.getAllJobsFromDb = async() => {
    let jobs = await Job.find();
    return jobs

}

JobsServices.unlockCompanyNameInput = async() => {
    //click pencil Icon
    id = "companyNameChangeRadioButtonPostingOnBehalf"
    await this.page.waitForXPath(`//*[@id="change-company-link"]`);
    let [companyNamePencil] = await this.page.$x(`//*[@id="change-company-link"]`);
    if (companyNamePencil) {
        await companyNamePencil.click();
    }

    //chose company name change reason
    await this.page.waitForXPath(`//*[@for="companyNameChangeRadioButtonPostingOnBehalf"]`);
    let [companyNameChangeReason] = await this.page.$x(`//*[@for="companyNameChangeRadioButtonPostingOnBehalf"]`);
    await companyNameChangeReason.click();
}

JobsServices.fillIn_CompanyName = async(companyName) => {

    await this.page.waitForXPath(`//*[@id="input-company"]`);
    let [JobCompanyNameInput] = await this.page.$x(`//*[@id="input-company"]`);

    if (process.env.TYPING_METHODE == "keyboard") {
        await JobCompanyNameInput.click({ clickCount: 3 });
        await JobCompanyNameInput.press('Backspace');
        await JobCompanyNameInput.type(companyName);
    } else {
        await this.page.evaluate((companyName) => {
            document.querySelector(`#input-company`).value = companyName;
        }, companyName);
        await this.page.evaluate((companyName) => {
            document.querySelector(`#input-company`).value = companyName;
        }, companyName);
        await JobCompanyNameInput.type(' ');
        await this.page.waitForTimeout(1000);
        await JobCompanyNameInput.press('Enter');
    }


}

JobsServices.fillIn_JobTitle = async(jobTitle) => {
    await this.page.waitForXPath(`//*[@id="JobTitle"]`);
    let [jobTitleInput] = await this.page.$x(`//*[@id="JobTitle"]`);
    //writing using the keyboard methode
    if (process.env.TYPING_METHODE == "keyboard") {
        await jobTitleInput.click({ clickCount: 3 });
        await jobTitleInput.press('Backspace');
        await jobTitleInput.type(jobTitle);
    }
    //writing using binding methode
    else {
        await jobTitleInput.type(' ');
        await jobTitleInput.press('Backspace');
        await this.page.evaluate((jobTitle) => {
            document.querySelector(`#JobTitle`).value = jobTitle;
        }, jobTitle);
        await jobTitleInput.press('Enter');
    }


}

JobsServices.fillIn_JobCategory = async() => {
    //wait for 3 seconds to make sure that category exists 
    await this.page.waitForTimeout(3 * 1000);
    let [firstChoice] = await this.page.$x(`//*[@name="jobOccupationOption"]/label`)
    if (firstChoice) {
        await firstChoice.click();
    }
}

JobsServices.fillIn_industry = async() => {
    //wait for 3 seconds to make sure that the industry input exists 
    await this.page.waitForTimeout(3 * 1000);
    let [select] = await this.page.$x(`//*[@advertisercompanymetadataindustry]`)
    if (select) {
        await select.click();
        await this.page.waitForTimeout(1 * 1000);
        let [RestaurantsOption] = await this.page.$x(`//*[contains(@label,"Restaurants & Food")]`)
        await RestaurantsOption.click();
    }
}

JobsServices.fillIn_RolesLocation = async(location) => {

    let city = location.city;
    let state = location.state;
    //click on one location option
    await this.page.waitForXPath(`//*[@for="roleLocationTypeRadiosOneLocation"]`);
    let [oneLocation] = await this.page.$x(`//*[@for="roleLocationTypeRadiosOneLocation"]`);
    await oneLocation.click();
    //click dont include the address option
    await this.page.waitForXPath(`//*[@id="ecl-RadioItem-label-HideExactLocation"]`);
    let [hideExactLocation] = await this.page.$x(`//*[@id="ecl-RadioItem-label-HideExactLocation"]`);
    await hideExactLocation.click();
    //fill in the city 
    await this.page.waitForXPath(`//*[@id="precise-address-city-input"]`);
    let [cityInput] = await this.page.$x(`//*[@id="precise-address-city-input"]`);

    if (process.env.TYPING_METHODE == "keyboard") {
        await cityInput.click({ clickCount: 3 });
        await cityInput.press("Backspace");
        await cityInput.type(city);
    } else {
        await this.page.evaluate((city) => {
            document.querySelector(`#precise-address-city-input`).value = city;
        }, city);
        await cityInput.type(' ');
        await cityInput.press('Backspace');
    }

    // fill in the state
    await this.page.select('[name="region"]', state)

    //wait for Advertising location to apply 
    await this.page.waitForTimeout(3 * 1000);



}

JobsServices.clickSaveAndContinue = async() => {
    [saveAndContinue1] = await this.page.$x(`//*[text()='Save and continue']`);
    [saveAndContinue2] = await this.page.$x(`//*[text()='Continue']`);
    if (saveAndContinue1) {
        await saveAndContinue1.click({ clickCount: 3 });
    } else if (saveAndContinue2) {
        await saveAndContinue2.click({ clickCount: 3 });
    }
    await this.page.waitForTimeout(100);
    //second retry
    try {
        if (saveAndContinue1) {
            await saveAndContinue1.click({ clickCount: 3 });
        } else if (saveAndContinue2) {
            await saveAndContinue2.click({ clickCount: 3 });
        }
    } catch (error) {

    }
    await this.page.waitForTimeout(3000);

}

JobsServices.fillIn_isJobFullTimeOrPartTime = async(jobDetails_WhatTypeOfJobIsIt) => {

    //full time
    if (jobDetails_WhatTypeOfJobIsIt == 'FULLTIME') {
        await this.page.waitForXPath(`//*[text()='Full-time']`);
        let [fullTimeRadioButton] = await this.page.$x(`//*[text()='Full-time']`);
        await fullTimeRadioButton.click();
    }

    //part time    
    else if (jobDetails_WhatTypeOfJobIsIt == 'PARTTIME') {
        await this.page.waitForXPath(`//*[text()='Part-time']`);
        let [PartTimeRadioButton] = await this.page.$x(`//*[text()='Part-time']`);
        await PartTimeRadioButton.click();
    }
    // else full time
    else {
        console.log('we didnt know the type of employment :' + jobDetails_WhatTypeOfJobIsIt, 'now choosing full time...')
        await this.page.waitForXPath(`//*[text()='Full-time']`);
        let [fullTimeRadioButton] = await this.page.$x(`//*[text()='Full-time']`);
        await fullTimeRadioButton.click();
    }
}


JobsServices.fillIn_schedule = async() => {
    await this.page.waitForXPath(`//*[contains(text(),'Other')]`);
    let [otherScheduleOption] = await this.page.$x(`//*[contains(text(),'Other')]`);
    await otherScheduleOption.click();
}

JobsServices.fillIn_hiresNumber = async(jobDetails_intHiresNeeded) => {
    if (jobDetails_intHiresNeeded > 0 && jobDetails_intHiresNeeded <= 10) {
        await this.page.select(`#intHiresNeeded`, jobDetails_intHiresNeeded)
    } else if (jobDetails_intHiresNeeded > 10) {
        await this.page.select(`#intHiresNeeded`, 'TEN_PLUS')
    } else {
        await this.page.select(`#intHiresNeeded`, 'RECURRING_HIRE')
    }
}

JobsServices.fillIn_deadline = async(jobDetails_expectedHireDate) => {
    await this.page.select(`#expectedHireDate`, jobDetails_expectedHireDate)
}

JobsServices.fillIn_paymentType = async(jobDetails_salaryRangeType, jobDetails_SalaryFrom, jobDetails_SalaryTo) => {
    //find the salary Range Type
    if (jobDetails_salaryRangeType) {
        let [jobSalaryRangeType] = await this.page.$x(`//*[@id="JobSalaryRangeType"]`);
        if (jobSalaryRangeType) {
            await this.page.select(`[name="jobsalaryrangetype"]`, jobDetails_salaryRangeType)
            return true;
        }
    } else if (jobDetails_SalaryFrom && jobDetails_SalaryTo) {
        jobDetails_salaryRangeType = findRangeType(jobDetails_SalaryFrom, jobDetails_SalaryTo)
        let [jobSalaryRangeType] = await this.page.$x(`//*[@id="JobSalaryRangeType"]`);
        if (jobSalaryRangeType) {
            await this.page.select(`#JobSalaryRangeType`, jobDetails_salaryRangeType)
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
            [jobSalary1] = await this.page.$x(`//*[@id="ipl-ComboBox-JobSalary1"]`);
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
            [jobSalary1] = await this.page.$x(`//*[@id="ipl-ComboBox-JobSalary1"]`);
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
            [jobSalary1] = await this.page.$x(`//*[@id="ipl-ComboBox-JobSalary1"]`);
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
            [jobSalary1] = await this.page.$x(`//*[@id="ipl-ComboBox-JobSalary1"]`);
            [jobSalary2] = await this.page.$x(`//*[@id="ipl-ComboBox-JobSalary2"]`);
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
    let [jobSalary1] = await this.page.$x(`//*[@id="ipl-ComboBox-JobSalary1"]`);
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
        [jobSalaryInput] = await this.page.$x(`//*[@id="ipl-ComboBox-JobSalary1"]`);
    } else {
        [jobSalaryInput] = await this.page.$x(`//*[@id="ipl-ComboBox-JobSalary2"]`);
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
    let [jobSalaryPeriod] = await this.page.$x(`//*[@id="JobSalaryPeriod"]`);
    if (jobSalaryPeriod && jobDetails_SalaryPer) {
        await this.page.select(`[name="jobsalaryperiod"]`, jobDetails_SalaryPer)
        return true;
    } else {
        return false;
    }
}

JobsServices.fillIn_description = async(jobDescriptionHtml) => {
    // split description to array 
    // let descriptionArray = descriptionToArray(jobDescriptionHtml);

    //start filling the descritpion
    await this.page.waitForXPath(`//*[text()='Job Description']`);

    await this.page.$eval('#JobDescription-editor-content', (el, jobDescriptionHtml) => { el.innerHTML = jobDescriptionHtml }, jobDescriptionHtml);

    //type space to apply changements
    let [descriptionInput] = await this.page.$x(`//*[@id="JobDescription-editor-content"]`);
    await descriptionInput.type(' ')

}


JobsServices.fillIn_isResumeRequired = async() => {
    await this.page.waitForXPath(`//*[@id="radio-applicationemailresumerequirement-REQUIRED"]`);
    let [resumeRequiredButton] = await this.page.$x(`//*[@id="radio-applicationemailresumerequirement-REQUIRED"]`);
    await resumeRequiredButton.click();
    return true;
}

JobsServices.click_confirm = async() => {
    await this.page.waitForXPath(`//*[@data-tn-element="sheet-next-button"]`);
    let [confirmButton] = await this.page.$x(`//*[@data-tn-element="sheet-next-button"]`);
    await confirmButton.click();
}

JobsServices.click_advanced = async() => {
    await this.page.waitForXPath(`//*[@id="ADVANCED"]`);
    let [budgetAdvancedButton] = await this.page.$x(`//*[@id="ADVANCED"]`);
    await budgetAdvancedButton.click();
}

JobsServices.fillIn_adDurationType = async() => {
    await this.page.waitForXPath(`//*[@name="jobDurationSelector"]`);
    await this.page.select(`[name="jobDurationSelector"]`, "CUSTOM_END_DATE");
}

JobsServices.fillIn_adDurationDate = async() => {
    let response = await axios.get(`http://worldclockapi.com/api/json/est/now`)
    console.log('tdays date : ' + response.data.currentDateTime);

    //generate new date after 4 days
    let newEndDate = Moment(response.data.currentDateTime).add(4, 'days');
    console.log('newEndDate + 4 : ' + newEndDate);

    // change its Format
    newEndDate = newEndDate.format('MM/DD/YYYY');
    console.log('newEndDate + format : ' + newEndDate);

    //fill in the input
    let [endDateInput] = await this.page.$x(`//*[@id="endDateContainer-0"]/input`);
    await endDateInput.click({ clickCount: 3 });
    await endDateInput.press('Backspace');
    await endDateInput.type(newEndDate)

}

JobsServices.fillIn_CPC = async(budget_maxCPC) => {
    await this.page.waitForXPath(`//*[@id="maxcpc"]`);
    let [maxCPC] = await this.page.$x(`//*[@id="maxcpc"]`);
    if (budget_maxCPC) {
        await maxCPC.click({ clickCount: 3 });
        await maxCPC.press('Backspace');
        await maxCPC.type(budget_maxCPC);
    }
}

JobsServices.fillIn_webSite = async() => {
    await this.page.waitForXPath(`//*[@name="CO_WEBSITE"]`);
    let [websiteInput] = await this.page.$x(`//*[@name="CO_WEBSITE"]`);
    if (websiteInput) {
        await websiteInput.click({ clickCount: 3 });
        await websiteInput.press('Backspace');
        await websiteInput.type('https://jobs.crelate.com/portal/misenplace');
    }
}

JobsServices.fillIn_adBudget = async(budget_amount) => {
    let [budgetInput] = await this.page.$x(`//*[@id="advanced-budget"]`);
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
    await this.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobId}`, { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(2000);
    await this.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobId}`, { waitUntil: 'networkidle0' });


    await this.page.waitForXPath(`//span[contains(text(),'Status')]`);
    let [jobStatusMenu] = await this.page.$x(`//span[contains(text(),'Status')]`);
    await jobStatusMenu.click();

    await this.page.waitForXPath(`//*[contains(text(),'Close job')]`);
    let [closeJobOption] = await this.page.$x(`//*[contains(text(),'Close job')]`);
    await closeJobOption.click();

    await this.page.waitForXPath(`//*[contains(text(),"I didn't hire anyone")]`);
    let [IDidntHireChoice] = await this.page.$x(`//*[contains(text(),"I didn't hire anyone")]`)
    await IDidntHireChoice.click();


    await this.page.waitForXPath(`//*[@id="plugin_container_PauseOrCloseJobModalContent"]/div/div/div/div/div[1]/div[2]/div[2]/button`);
    let [continueCloseButton] = await this.page.$x(`//*[@id="plugin_container_PauseOrCloseJobModalContent"]/div/div/div/div/div[1]/div[2]/div[2]/button`)
    await continueCloseButton.click();


    await this.page.waitForXPath(`//*[contains(text(),"Other")]`);
    let other = await this.page.$x(`//*[contains(text(),"Other")]`)
    other = other[1]
    await other.click();

    await this.page.waitForXPath(`//*[@id="plugin_container_PauseOrCloseJobModalContent"]/div/div/div/div/div[1]/div[2]/div[2]/button/span`);
    let [closeJobButton] = await this.page.$x(`//*[@id="plugin_container_PauseOrCloseJobModalContent"]/div/div/div/div/div[1]/div[2]/div[2]/button/span`)
    await closeJobButton.click();
    await this.page.waitForTimeout(2000);

}

JobsServices.fillIn_email = async(jobDetails_emails) => {
    await this.page.waitForXPath(`//*[@name="communication-settings-email-input_primary"]`);
    let [emailInput] = await this.page.$x(`//*[@name="communication-settings-email-input_primary"]`);
    if (process.env.TYPING_METHODE == "keyboard") {
        await emailInput.click({ clickCount: 3 });
        await emailInput.press('Backspace');
        await emailInput.type(jobDetails_emails);
    } else {
        await emailInput.type(' ');
        await emailInput.press('Backspace');
        await this.page.evaluate((jobDetails_emails) => {
            document.querySelector(`[name="communication-settings-email-input_primary"]`).value = jobDetails_emails;
        }, jobDetails_emails);
        await this.page.evaluate((jobDetails_emails) => {
            document.querySelector(`[name="communication-settings-email-input_primary"]`).value = jobDetails_emails;
        }, jobDetails_emails);
        await emailInput.press('Enter');
    }

}

JobsServices.close_questions = async() => {
    await this.page.waitForXPath(`//*[@aria-label="Remove question"]`);
    let xButtons = await this.page.$x(`//*[@aria-label="Remove question"]`);
    for (const xButton of xButtons) {
        await xButton.click();
    }
}

JobsServices.fillIn_isJobRemote = async() => {
    await this.page.waitForXPath(`//*[@for="radio-work_remotely-NO"]`);
    let [noButton] = await this.page.$x(`//*[@for="radio-work_remotely-NO"]`);
    await noButton.click();
    await this.page.waitForTimeout(200);
    await noButton.click();

}
JobsServices.fillIn_otherBenefits = async() => {
    await this.page.waitForXPath(`//*[contains(text(),'Other')]`);
    let otherButton = await this.page.$x(`//*[contains(text(),'Other')]`);
    await otherButton[1].click();
}

module.exports = JobsServices;