const fs = require('fs');
const path = require('path');

function getCSRFToken() {
    try {
        const file = fs.readFileSync("cookies/cookies.json", 'utf8');
        let cookies = JSON.parse(file);
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