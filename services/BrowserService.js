const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
const { loadCookies } = require('../utilities/loadCookies');
const { saveCookies } = require('../utilities/saveCookies');

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
            await loadCookies(page);
        }
    });
    await BrowserService.getNewPage();
    await BrowserService.page.goto('https://employers.indeed.com/');
    //? save cookies
    // const cookies = await BrowserService.page.cookies();
    // await saveCookies(cookies);
}


BrowserService.getNewPage = async function() {
    //get new page 
    BrowserService.page = await BrowserService.browser.newPage();
    BrowserService.page.setDefaultTimeout(1 * 60 * 1000);
    BrowserService.page.on('response', async(response) => {
        try {


            if (response.url().includes('orientation-sheet')) {
                try {
                    await this.page.waitForTimeout(2000);
                    let [startFromScratchButton] = await this.page.$x(`//*[@id="StartFromScratch-radio"]/parent::label`);
                    if (startFromScratchButton) {
                        await startFromScratchButton.click()
                    }
                } catch (error) {
                    console.log('couldnt click :  startFromScratchButton ')
                }

                try {
                    await this.page.waitForTimeout(2000);
                    let [startOverButton] = await this.page.$x(`//*[text()='Start over']/parent::button`)
                    if (startOverButton) {
                        await startOverButton.click()
                    }
                } catch (error) {
                    console.log('couldnt click :  startOverButton ')
                }

                try {
                    await this.page.waitForTimeout(4000);
                    let [isIntroPage] = await this.page.$x(`//*[text()='How would you like to build your post?']`)
                    let [continueButton] = await this.page.$x(`//*[text()='Continue']/parent::span/parent::span`)
                    if (continueButton && isIntroPage) {
                        await continueButton.click()
                    }
                } catch (error) {
                    console.log('couldnt click :  continueButton in Intro page ')
                }



            }



        } catch (error) {
            console.log('error catched on  event listener : ' + error)
        }

    });
}


module.exports = BrowserService;