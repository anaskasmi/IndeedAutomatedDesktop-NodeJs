const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
const CookiesService = require('./cookiesService');
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
    //allow only one browser and one page to be opened
    if (this.browser && (await this.browser.pages()).length > 0) {
        return;
    }

    // get new browser
    // const browserFetcher = puppeteer.createBrowserFetcher();

    // const revisionInfo = await browserFetcher.download('639839');

    this.browser = await puppeteer.launch({
        headless: false,
        // executablePath: revisionInfo.executablePath,
        args,
        // defaultViewport: null,
        executablePath: process.platform == "win32" ? process.env.CHROME_EXECUTABLE_PATH_WINDOWS : process.env.CHROME_EXECUTABLE_PATH_MAC,
        dumpio: true
    });

    //when page created, set up the view port and the proxy 
    this.browser.on('targetcreated', async target => {
        if (target.type() === 'page') {
            const page = await target.page();
            await CookiesService.loadCookiesToPage(page);
        }
    });
    await BrowserService.getNewPage();
    await BrowserService.page.goto('https://employers.indeed.com/');
}


BrowserService.getNewPage = async function() {
    //get new page 
    BrowserService.page = await BrowserService.browser.newPage();
    BrowserService.page.setDefaultTimeout(1 * 60 * 1000);
}


module.exports = BrowserService;