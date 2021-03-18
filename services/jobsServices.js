const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
const { normalizeJobs } = require('../utilities/normalizeJobs');
const { normalizeFullDetailedJob } = require('../utilities/normalizeFullDetailedJob');
const { findRangeType } = require('../utilities/findRangeType');
const { descriptionToArray } = require('../utilities/descriptionToArray');
const { loadCookies } = require('../utilities/loadCookies');
const Moment = require('moment');

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
            '--proxy-server=zproxy.lum-superproxy.io:22225',

        ],
        // defaultViewport: null,
        executablePath: 'C:/Users/Anas/AppData/Roaming/npm/node_modules/puppeteer/.local-chromium/win64-818858/chrome-win/chrome.exe'

    });
    //when page created, set up the view port and the proxy 
    this.browser.on('targetcreated', async target => {
        if (target.type() === 'page') {
            const page = await target.page();
            await page.authenticate({
                username: 'lum-customer-hl_2241b018-zone-residential',
                password: '62gz3mhgm35h',
            });
            await loadCookies(page);
        }
    })

    //get new page 
    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(60 * 1000);
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
    await this.page.goto(`https://employers.indeed.com/p#post-job/edit-job?id=${jobId}`, { waitUntil: 'networkidle0' });

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
    await this.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobId}`, { waitUntil: 'networkidle0' });
    //second retry
    if (!unormalizedJobFromJobShowPage) {
        console.log('unormalizedJobFromJobShowPage not found retry...')
        await this.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobId}`, { waitUntil: 'networkidle0' });
    }
    if (!unormalizedJobFromJobEditPage) {
        console.log('unormalizedJobFromJobEditPage not found retrying ...')
        await this.page.goto(`https://employers.indeed.com/p#post-job/edit-job?id=${jobId}`, { waitUntil: 'networkidle0' });
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
    await JobCompanyNameInput.click({ clickCount: 3 });
    await JobCompanyNameInput.press('Backspace');
    await this.page.keyboard.type(companyName, { delay: 20 });
}

JobsServices.fillIn_JobTitle = async(jobTitle) => {
    let [jobTitleInput] = await this.page.$x(`//*[@id="JobTitle"]`);
    await jobTitleInput.click({ clickCount: 3 });
    await jobTitleInput.press('Backspace');
    await this.page.keyboard.type(jobTitle, { delay: 5 });
    await this.page.keyboard.press('Enter');
}

JobsServices.fillIn_JobCategory = async() => {
    //todo:make sure this happens after filling the address
    //wait for 3 seconds to make sure that category exists 
    await this.page.waitForTimeout(3 * 1000);
    let firstChoice = await this.page.$x(`//*[@name="jobOccupationOption"]`)
    if (firstChoice.length) {
        firstChoice = firstChoice[1];
        await firstChoice.click();
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
    await cityInput.click({ clickCount: 3 });
    await cityInput.press('Backspace');
    await this.page.waitForTimeout(1000)
    await cityInput.click({ clickCount: 3 });
    await cityInput.press('Backspace');

    await this.page.keyboard.type(city, { delay: 20 });

    // fill in the state
    await this.page.select('#precise-address-state-input', state)

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
            await this.page.select(`#JobSalaryRangeType`, jobDetails_salaryRangeType)
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
        await this.page.select(`#JobSalaryPeriod`, jobDetails_SalaryPer)
        return true;
    } else {
        return false;
    }
}

JobsServices.fillIn_description = async(jobDescriptionHtml) => {
    // split description to array 
    let descriptionArray = descriptionToArray(jobDescriptionHtml);

    //start filling the descritpion
    await this.page.waitForXPath(`//*[text()='Job Description']`);

    let [descriptionInput] = await this.page.$x(`//*[@id="JobDescription-editor-content"]`);
    let [boldButton] = await this.page.$x(`//*[@id="JobDescription"]/div/div[1]/button[1]`);
    let [unorderedListButton] = await this.page.$x(`//*[@id="JobDescription"]/div/div[1]/button[3]`);
    let newUl;
    let boldClickedXpath = `//*[@id="JobDescription"]/div/div[1]/button[1]`;
    let isBoldClicked;
    //type test and delete 
    await descriptionInput.type("test");
    await descriptionInput.click({ clickCount: 3 });
    await descriptionInput.press('Backspace');
    //start typing words
    for (const word of descriptionArray) {
        switch (word) {
            case '<p>':
                break;
            case '</p>':
                break;
            case '<b>':
                await boldButton.click();
                [isBoldClicked] = await this.page.$x(boldClickedXpath);
                if (!isBoldClicked) {
                    console.log('NOOT bold retrying...')
                    await descriptionInput.type("a");
                    await descriptionInput.press('Backspace');
                    await boldButton.click();
                }
                break;
            case '</b>':
                await boldButton.click();
                [isBoldClicked] = await this.page.$x(boldClickedXpath);
                if (isBoldClicked) {
                    console.log('still bold retrying...')
                    await descriptionInput.type("a");
                    await descriptionInput.press('Backspace');
                    await boldButton.click();
                }
                break;
            case '<ul>':
                newUl = true;
                break;
            case '</ul>':
                await unorderedListButton.click();
                break;
            case '<li>':
                break;
            case '</li>':
                if (newUl) {
                    await unorderedListButton.click();

                    await this.page.keyboard.down('ControlLeft');
                    await this.page.keyboard.down('a');

                    await this.page.keyboard.up('a');
                    await this.page.keyboard.up('ControlLeft');

                    await this.page.keyboard.press('ArrowRight');
                    newUl = false;
                }
                break;
            case "&amp;":
                await descriptionInput.type("&");
                break;
            default:
                if (word.trim() == '') {
                    await this.page.keyboard.press('Enter');
                } else {
                    await descriptionInput.type(word);
                }
                break;
        }
    }
}


JobsServices.fillIn_isResumeRequired = async() => {
    // if (resumeRequirement != "REQUIRED") {
    //     await this.page.waitForXPath(`//*[@id="radio-applicationemailresumerequirement-OPTIONAL"]`);
    //     let [resumeOptionalButton] = await this.page.$x(`//*[@id="radio-applicationemailresumerequirement-OPTIONAL"]`);
    //     await resumeOptionalButton.click();
    // } else {

    // }
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
    await this.page.waitForXPath(`//*[@id="jobDurationSelector"]`);
    await this.page.select(`#jobDurationSelector`, "CUSTOM_END_DATE");
}

JobsServices.fillIn_adDurationDate = async() => {
    //calculate EndDate (today's date + 4 days)
    let newEndDate = Moment(Moment()).add(4, 'days');
    //change its Format
    newEndDate = newEndDate.format('MM/DD/YYYY')
        //select ad duration = custom end date
    await this.page.select(`#jobDurationSelector`, "CUSTOM_END_DATE");
    await this.page.waitForXPath(`//*[@id="endDateContainer-0"]/input`);
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




module.exports = JobsServices;