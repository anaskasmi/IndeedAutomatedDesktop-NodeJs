const fs = require('fs').promises;
const path = require('path');

const saveCookies = async(cookies) => {
    try {
        const COOKIES_URI = path.join('cookies', 'cookies.json');
        await fs.writeFile(COOKIES_URI, JSON.stringify(cookies, null, 2));
        console.log('cookies saved')
    } catch (error) {
        console.log(error)
    }


}

exports.saveCookies = saveCookies;