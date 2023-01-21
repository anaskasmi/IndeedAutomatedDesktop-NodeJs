const fs = require('fs');
const path = require('path');

function getCookiesAsText() {
    let cookieData = ""
    let cookies;
    try {
        const file = fs.readFileSync("cookies/cookies.json", 'utf8');
        cookies = JSON.parse(file);
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