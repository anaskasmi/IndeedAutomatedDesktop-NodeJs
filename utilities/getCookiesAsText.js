const fs = require('fs').promises;
const path = require('path');

const getCookiesAsText = async() => {
    let cookieData = ""
    let cookies;
    try {
        const COOKIES_URI = path.join('cookies', 'cookies.json');
        const cookiesString = await fs.readFile(COOKIES_URI);
        cookies = JSON.parse(cookiesString);
    } catch (err) {
        console.error(err);
        return;
    }
    cookies.forEach(cookie => {
        cookieData += `${cookie.name}=${cookie.value}; `;
    });
    return cookieData;
}


exports.getCookiesAsText = getCookiesAsText;