const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
const { normalizeJobs } = require('../utilities/normalizeJobs');

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
        if (!jobDetails_salaryRangeType && jobDetails_SalaryFrom && jobDetails_SalaryTo) {
            jobDetails_salaryRangeType = findRangeType(jobDetails_SalaryFrom, jobDetails_SalaryTo)
            let [jobSalaryRangeType] = await this.page.$x(`//*[@id="JobSalaryRangeType"]`);
            if (jobSalaryRangeType) {
                await this.page.select(`#JobSalaryRangeType`, jobDetails_salaryRangeType)
                return true;
            }
        }
        return false;
    }

    fillIn_paymentFrom = async() => {

    }

    fillIn_paymentTo = async() => {

        }
        //todo

    fillIn_paymentPer = async() => {

        }
        //todo

    fillIn_compensation = async() => {

        }
        //todo

    fillIn_benefits = async() => {

        }
        //todo

    fillIn_description = async() => {

        }
        //todo

    fillIn_isResumeRequired = async() => {

        }
        //todo

    click_confirm = async() => {

        }
        //todo

    click_advanced = async() => {

        }
        //todo

    fillIn_adDurationType = async() => {

        }
        //todo

    fillIn_adDurationDate = async() => {

        }
        //todo

    fillIn_CPC = async() => {

        }
        //todo

    fillIn_adBudget = async() => {

        }
        //todo

    click_noThanks = async() => {

        }
        //todo

    click_notIntersted = async() => {

        }
        //todo

    closeJob = async() => {

    }


}