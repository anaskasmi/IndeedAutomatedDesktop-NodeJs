const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
const { normalizeJobs } = require('../utilities/normalizeJobs');
const { findRangeType } = require('../utilities/findRangeType');
const { descriptionToArray } = require('../utilities/descriptionToArray');

exports.JobServices = class JobServices {
    browser = null;
    page = null;

    //get new browser and set up its params
    getNewBrowser = async() => {
        //allow only one browser and one page to be opened
        if (this.browser) {
            return;
        }
        try {
            // get new browser
            this.browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-features=site-per-process',
                    '--start-maximized',
                    '--font-render-hinting=none',
                    '--proxy-server=zproxy.lum-superproxy.io:22225',
                    '--disable-gpu',
                    '--window-size=400,825'
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
                    // await loadCookies(page);
                    await page.setViewport({
                        width: 400,
                        height: 825,
                    });

                }
            })

            //get new page 
            await this.browser.newPage();
            this.page.setDefaultTimeout(0);

        } catch (error) {
            console.log(error)
        }
    }


    //open Login Page
    openLoginPage = async() => {
        try {
            await this.page.goto('https://employers.indeed.com/');
        } catch (error) {
            console.log(error)
        }
    }


    //close browser
    closeBrowser = async() => {
        try {
            this.browser.close();
        } catch (error) {
            console.log(error)
        }
    }



    openPostJobPage = async(id) => {
        try {
            await this.page.goto(`https://employers.indeed.com/j#jobs/view?id=${id}`)
        } catch (error) {
            console.log(error)
        }
    }

    //todo
    getJobFullDetails = async(id) => {
        try {

        } catch (error) {
            console.log(error)
        }
    }


    downloadCookies = async() => {
        const cookies = await this.page.cookies();
        await fs.writeFile(path.join(__dirname, 'cookies', 'cookies.json'), JSON.stringify(cookies, null, 2));
    }

    loadCookies = async() => {
        let cookiesFilePath = path.join(__dirname, 'cookies', 'cookies.json');
        if (!fs.existsSync(cookiesFilePath)) {
            return false
        }
        const cookiesString = await fs.readFile(cookiesFilePath);
        const cookies = JSON.parse(cookiesString);
        await this.page.setCookie(...cookies);
        return true;
    }

    isLoggedIn = async() => {
        await this.page.goto('https://employers.indeed.com/', { waitUntil: 'load' });
        let [notLoggedInIndicator] = await page.$x('//*[@id="login-email-input"]');
        if (notLoggedInIndicator) {
            console.log('not logged in')
            return false;
        } else {
            console.log('already logged in')
            return true;
        }
    }

    scrapAllJobs = async() => {
        const jobsArray = [];
        this.page.on('response', (response) => {
            if (response.url().includes('graph')) {
                response.json().then((res) => {
                    if (res.data.jobs) {
                        for (const job of res.data.jobs) {
                            jobsArray.push(job);
                        }
                    }

                })
            }
        });
        await this.page.goto(`https://employers.indeed.com/j#jobs`, { waitUntil: 'networkidle0' });
        let normalizedJobs = await normalizeJobs(jobsArray);
        return normalizedJobs;

    }

    unlockCompanyNameInput = async() => {
        //click pencil Icon
        await this.page.waitForXPath(`//*[@id="change-company-link"]`);
        let [companyNamePencil] = await this.page.$x(`//*[@id="change-company-link"]`);
        await companyNamePencil.click();

        //chose company name change reason
        await this.page.waitForXPath(`//*[@id="ecl-RadioItem-label-companyNameChangeRadioButtonPostingOnBehalf"]`);
        let [companyNameChangeReason] = await this.page.$x(`//*[@id="ecl-RadioItem-label-companyNameChangeRadioButtonPostingOnBehalf"]`);
        await companyNameChangeReason.click();
    }

    fillIn_CompanyName = async(companyName) => {
        await this.page.waitForXPath(`//*[@id="input-company"]`);
        let [JobCompanyNameInput] = await this.page.$x(`//*[@id="input-company"]`);
        await JobCompanyNameInput.click({ clickCount: 3 });
        await JobCompanyNameInput.press('Backspace');
        await this.page.keyboard.type(companyName, { delay: 20 });
    }

    fillIn_JobTitle = async(jobTitle) => {
        let [jobTitleInput] = await this.page.$x(`//*[@id="JobTitle"]`);
        await jobTitleInput.click({ clickCount: 3 });
        await jobTitleInput.press('Backspace');
        await this.page.keyboard.type(jobTitle, { delay: 20 });
        await this.page.keyboard.press('Enter');
    }

    fillIn_JobCategory = async() => {
        //todo:make sure this happens after filling the address
        //wait for 3 seconds to make sure that category exists 
        await this.page.waitForTimout(3 * 1000);
        let firstChoice = await this.page.$x(`//*[@name="jobOccupationOption"]`)
        if (firstChoice.length) {
            firstChoice = firstChoice[1];
            await firstChoice.click();
        }
    }

    fillIn_RolesLocation = async(location) => {
        //todo: parse location
        let city, state;
        //click on one location option
        await this.page.waitForXPath(`//*[@id="roleLocationTypeRadiosOneLocation"]`);
        let [oneLocation] = await this.page.$x(`//*[@id="roleLocationTypeRadiosOneLocation"]`);
        await oneLocation.click();
        //click dont include the address option
        await this.page.waitForXPath(`//*[@id='HideExactLocation']`);
        let [hideExactLocation] = await this.page.$x(`//*[@id='HideExactLocation']`);
        await hideExactLocation.click();
        //fill in the city 
        await this.page.waitForXPath(`precise-address-city-input`);
        let [cityInput] = await this.page.$x(`precise-address-city-input`);
        await cityInput.click({ clickCount: 3 });
        await cityInput.press('Backspace');
        await this.page.keyboard.type(city, { delay: 20 });

        // fill in the state
        await this.page.select('#precise-address-state-input', state)

        //wait for Advertising location to apply 
        await this.page.waitForTimout(3 * 1000);


    }

    clickSaveAndContinue = async() => {
        [saveAndContinue] = await page.$x(`//*[text()='Save and continue']`);
        await saveAndContinue.click();
        await page.waitForTimeout(3000);
    }

    fillIn_isJobFullTimeOrPartTime = async(jobDetails_WhatTypeOfJobIsIt) => {

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


    fillIn_schedule = async() => {
        await this.page.waitForXPath(`//*[contains(text(),'Other')]`);
        let [otherScheduleOption] = await this.page.$x(`//*[contains(text(),'Other')]`);
        await otherScheduleOption.click();
    }

    fillIn_hiresNumber = async(jobDetails_intHiresNeeded) => {
        if (jobDetails_intHiresNeeded > 0 && jobDetails_intHiresNeeded <= 10) {
            await this.page.select(`#intHiresNeeded`, jobDetails_intHiresNeeded)
        } else if (jobDetails_intHiresNeeded > 10) {
            await this.page.select(`#intHiresNeeded`, 'TEN_PLUS')
        } else {
            await this.page.select(`#intHiresNeeded`, 'RECURRING_HIRE')
        }
    }

    fillIn_deadline = async(jobDetails_expectedHireDate) => {
        await this.page.select(`#expectedHireDate`, jobDetails_expectedHireDate)
    }

    fillIn_paymentType = async(jobDetails_salaryRangeType, jobDetails_SalaryFrom, jobDetails_SalaryTo) => {
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

    fillIn_paymentFrom = async(jobDetails_SalaryFrom) => {
        let [jobSalary1] = await this.page.$x(`//*[@id="ipl-ComboBox-JobSalary1"]`);
        if (jobSalary1 && jobDetails_SalaryFrom) {
            await jobSalary1.click({ clickCount: 3 });
            await jobSalary1.press('Backspace');
            await jobSalary1.type(jobDetails_SalaryFrom)
            return true;
        } else {
            return false;
        }
    }

    fillIn_paymentTo = async(jobDetails_SalaryTo) => {
        let [jobSalary2] = await this.page.$x(`//*[@id="ipl-ComboBox-JobSalary2"]`);
        if (jobSalary2 && jobDetails_SalaryTo) {
            await jobSalary2.click({ clickCount: 3 });
            await jobSalary2.press('Backspace');
            await jobSalary2.type(jobDetails_SalaryTo)
            return true;
        } else {
            return false;
        }

    }


    fillIn_paymentPer = async(jobDetails_SalaryPer) => {
        let [jobSalaryPeriod] = await this.page.$x(`//*[@id="JobSalaryPeriod"]`);
        if (jobSalaryPeriod && jobDetails_SalaryPer) {
            await this.page.select(`#JobSalaryPeriod`, jobDetails_SalaryPer)
            return true;
        } else {
            return false;
        }
    }

    fillIn_description = async(jobDescriptionHtml) => {
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


    fillIn_isResumeRequired = async(resumeRequirement) => {
        if (resumeRequirement != "REQUIRED") {
            await this.page.waitForXPath(`//*[@id="radio-applicationemailresumerequirement-OPTIONAL"]`);
            let [resumeOptionalButton] = await this.page.$x(`//*[@id="radio-applicationemailresumerequirement-OPTIONAL"]`);
            await resumeOptionalButton.click();
        } else {
            await this.page.waitForXPath(`radio-applicationemailresumerequirement-REQUIRED`);
            let [resumeRequiredButton] = await this.page.$x(`radio-applicationemailresumerequirement-REQUIRED`);
            await resumeRequiredButton.click();
        }
        return true;
    }

    click_confirm = async() => {
        await this.page.waitForXPath(`//*[@data-tn-element="sheet-next-button"]`);
        let [confirmButton] = await this.page.$x(`//*[@data-tn-element="sheet-next-button"]`);
        await confirmButton.click();
    }

    click_advanced = async() => {
        await this.page.waitForXPath(`//*[@id="ADVANCED"]`);
        let [budgetAdvancedButton] = await this.page.$x(`//*[@id="ADVANCED"]`);
        await budgetAdvancedButton.click();
    }

    fillIn_adDurationType = async() => {
        await this.page.waitForXPath(`//*[@id="jobDurationSelector"]`);
        await this.page.select(`#jobDurationSelector`, "CUSTOM_END_DATE");
    }

    fillIn_adDurationDate = async() => {
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

    fillIn_CPC = async(budget_maxCPC) => {
        await this.page.waitForXPath(`//*[@id="maxcpc`);
        let [maxCPC] = await this.page.$x(`//*[@id="maxcpc"]`);
        if (budget_maxCPC) {
            await maxCPC.click({ clickCount: 3 });
            await maxCPC.press('Backspace');
            await maxCPC.type(budget_maxCPC);
        }
    }

    fillIn_adBudget = async() => {
        let [budgetInput] = await this.page.$x(`//*[@id="advanced-budget"]`);
        if (budgetInput && jobToRepost.budget_amount) {
            let budgetInDollar = Math.ceil(jobToRepost.budget_amount / 100).toString();
            await budgetInput.click({ clickCount: 3 });
            await budgetInput.press('Backspace');
            await budgetInput.type(budgetInDollar)
            return true;
        } else {
            return false;
        }
    }

    closeJob = async() => {
        await this.page.goto(`https://employers.indeed.com/j#jobs/view?id=${jobToRepost.job_id}`, { waitUntil: 'networkidle0' });


        await this.page.waitForXPath(`//*[@id="sidebarStatusButton"]/span/span/div/div/div[1]/button`);
        let [jobStatusMenu] = await this.page.$x(`//*[@id="sidebarStatusButton"]/span/span/div/div/div[1]/button`);
        await jobStatusMenu.click();

        await this.page.waitForXPath(`//*[@id="sidebarStatusButton"]/span/span/div/div/div[2]/ul/li[2]/a`);
        let [closeJobOption] = await this.page.$x(`//*[@id="sidebarStatusButton"]/span/span/div/div/div[2]/ul/li[2]/a`);
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


}