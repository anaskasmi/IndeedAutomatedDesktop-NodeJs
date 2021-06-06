const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
const { loadCookies } = require('../utilities/loadCookies');

let args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-features=site-per-process',
    '--start-maximized',
    '--font-render-hinting=none',
    '--disable-gpu',
];

let BrowserService = {

}


BrowserService.closeBrowser = async function() {
    if (this.browser) {
        await this.browser.close();
    }
};



//get new browser and set up its params
BrowserService.getNewBrowser = async function() {
    if (process.env.PROXY_ACTIVATED == 'true') {
        args.push('--proxy-server=' + process.env.PROXY_SERVER);
    }
    //allow only one browser and one page to be opened
    if (this.browser && (await this.browser.pages()).length > 0) {
        return;
    }

    // get new browser
    this.browser = await puppeteer.launch({
        headless: false,
        args,
        // defaultViewport: null,
        executablePath: process.platform == "win32" ? process.env.CHROME_EXECUTABLE_PATH_WINDOWS : process.env.CHROME_EXECUTABLE_PATH_MAC

    });

    //when page created, set up the view port and the proxy 
    this.browser.on('targetcreated', async target => {
        if (target.type() === 'page') {
            const page = await target.page();
            if (process.env.PROXY_ACTIVATED == 'true') {
                console.log('Enabling USA proxy..')
                await page.authenticate({
                    username: process.env.PROXY_USERNAME,
                    password: process.env.PROXY_PASSWORD,
                });
            }
            try {
                await loadCookies(page);
            } catch (error) {
                console.log('couldnt load cookies');
            }
        }
    });

    //get new page 
    this.page = await this.browser.newPage();

    this.page.setDefaultTimeout(2 * 60 * 1000);
    this.page.on('response', async(response) => {
        try {
            // if (response.url().includes('no-dupe-posting')) {
            //     this.page.waitForTimeout(3000);
            //     let [thiIsADifferentJob] = await this.page.$x(`//*[@for="next-step-radio--continue"]`);
            //     if (thiIsADifferentJob) {
            //         await thiIsADifferentJob.click()
            //     }
            //     let [continueButton] = await this.page.$x(`//*[@data-tn-element="sorepost-next-step-continue-continue"]`);
            //     if (continueButton) {
            //         await continueButton.click()
            //         this.page.waitForTimeout(3000);
            //     }

            // }


            if (response.url().includes('did-you-hire-sheet')) {
                {
                    // this.page.waitForTimeout(3000);
                    try {
                        await this.page.waitForXPath(`//*[@value="no"]/parent::label`)
                        await this.page.waitForXPath(`//*[contains(text(),'No')]`)
                    } catch (error) {
                        console.log('couldnt found the no button on the (did you hire sheet)')
                    }
                    // let [noLabel] = await this.page.$x(`//*[@value="no"]/parent::label`);
                    let [noLabel] = this.page.$x(`//*[contains(text(),'No')]`);
                    if (noLabel) {
                        //click no
                        await noLabel.click();
                        //click continue
                        let [continueButton] = await this.page.$x(`//*[text()='Continue']`);
                        await continueButton.click();
                        //click Other
                        await this.page.waitForXPath(`//*[text()='Other']`)
                        let [otherButton] = await this.page.$x(`//*[text()='Other']`);
                        await otherButton.click();
                        //click continue
                        [continueButton] = await this.page.$x(`//*[text()='Continue']`);
                        await continueButton.click();

                    }
                }
            }
        } catch (error) {
            console.log('error catched on  event listener : ' + error)
        }

    });
    await this.page.goto('https://employers.indeed.com/');
}





module.exports = BrowserService;