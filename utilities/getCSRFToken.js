const fs = require('fs').promises;
const path = require('path');

const getCSRFToken = async() => {
    try {
        const COOKIES_URI = path.join('cookies', 'cookies.json');
        const cookiesString = await fs.readFile(COOKIES_URI);
        const cookies = JSON.parse(cookiesString);
        let csrf = cookies.find(cookie => cookie.name === 'CSRF');
        if (csrf) {
            return csrf.value;
        } else {
            throw new Error("CSRF token not found in cookies");
        }
    } catch (err) {
        console.error(err);
        return;
    }
}



exports.getCSRFToken = getCSRFToken;