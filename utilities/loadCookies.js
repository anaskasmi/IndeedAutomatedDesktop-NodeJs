const fs = require('fs').promises;
const path = require('path');

const loadCookies = async(page) => {
    try {
        const COOKIES_URI = path.join('cookies', 'cookies.json');
        const cookiesString = await fs.readFile(COOKIES_URI);
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
    } catch (error) {
        console.log(error)
    }
}

exports.loadCookies = loadCookies;