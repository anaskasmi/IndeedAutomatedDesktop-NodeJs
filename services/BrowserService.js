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
    await BrowserService.getNewPage();
    await BrowserService.page.goto('https://employers.indeed.com/');
}


BrowserService.getNewPage = async function() {
    //get new page 
    BrowserService.page = await BrowserService.browser.newPage();
    BrowserService.page.setDefaultTimeout(1 * 60 * 1000);
    BrowserService.page.on('response', async(response) => {
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


            // if (response.url().includes('https://d3l2aiuysuvlk2.cloudfront.net/brotli/hiresignal/343126bfbc2d8bf6a72e/scripts/hiresignal-534.js')) {
            //     // await this.page.waitForTimeout(3000);
            //     let [skipButton] = await this.page.$x(`//*[@data-tn-element="navControlButton-skip"]`);
            //     if (skipButton) {
            //         console.log('found skip button')
            //         await skipButton.click();
            //     }
            // }



            // if (response.url().includes('did-you-hire-sheet')) {
            //     {
            //         // this.page.waitForTimeout(3000);
            //         try {
            //             await BrowserService.page.waitForXPath(`//*[@value="no"]/parent::label`)
            //         } catch (error) {
            //             console.log('couldnt found the no button on the (did you hire sheet)')
            //         }
            //         let [noLabel] = await BrowserService.page.$x(`//*[@value="no"]/parent::label`);
            //         if (noLabel) {
            //             //click no
            //             await noLabel.click();
            //             //click continue
            //             let [continueButton] = await BrowserService.page.$x(`//*[@data-tn-element="sheet-next-button"]`);
            //             await continueButton.click();
            //         }


            //     }
            // }
        } catch (error) {
            console.log('error catched on  event listener : ' + error)
        }

    });
}


module.exports = BrowserService;