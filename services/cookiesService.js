const fs = require('fs').promises;
const path = require('path');

const CookiesService = {
    cookiesAsText: null,
    headers: null,
    csrfToken: null,
    cookiesAsJson: null,
    getCookiesAsJson: async() => {
        if (CookiesService.cookiesAsJson) {
            return CookiesService.cookiesAsJson;
        }
        const COOKIES_URI = path.join('cookies', 'cookies.json');
        const cookiesString = await fs.readFile(COOKIES_URI);
        CookiesService.cookiesAsJson = JSON.parse(cookiesString);
        return CookiesService.cookiesAsJson;
    },
    getCookiesAsText: async() => {
        if (CookiesService.cookiesAsText) {
            return CookiesService.cookiesAsText;
        }
        let cookieData = ""
        const cookies = await CookiesService.getCookiesAsJson()
        cookies.forEach(cookie => {
            cookieData += `${cookie.name}=${cookie.value}; `;
        });
        CookiesService.cookiesAsText = cookieData;
        return cookieData;
    },
    getCSRFToken: async() => {
        try {
            const cookies = await CookiesService.getCookiesAsJson()
            let csrf = cookies.find(cookie => cookie.name === 'CSRF');
            if (csrf) {
                return csrf.value;
            } else {
                throw new Error("CSRF token not found in cookies");
            }
        } catch (err) {
            console.error(err);
            throw new Error("CSRF token error");
        }
    },
    getHeaders: async() => {
        if (CookiesService.headers) {
            return CookiesService.headers;
        }
        const cookies = await CookiesService.getCookiesAsText()
        const headers = {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "indeed-api-key": "0f2b0de1b8ff96890172eeeba0816aaab662605e3efebbc0450745798c4b35ae",
            "indeed-client-sub-app": "job-posting",
            "indeed-client-sub-app-component": "./JobDescriptionSheet",
            "sec-ch-ua": "\"Google Chrome\";v=\"105\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"105\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Mac OS X\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-datadog-origin": "rum",
            "x-datadog-parent-id": "8923979220855812101",
            "x-datadog-sampling-priority": "1",
            "x-datadog-trace-id": "544488856865798606",
            "cookie": cookies,
            "Referer": "https://employers.indeed.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        };
        CookiesService.headers = headers;
        return headers;
    },
    loadCookiesToPage: async(page) => {
        try {
            const cookies = await CookiesService.getCookiesAsJson()
            await page.setCookie(...cookies);
        } catch (error) {
            console.log(error)
        }
    },
    saveCookies: async(cookies) => {
        try {
            const COOKIES_URI = path.join('cookies', 'cookies.json');
            await fs.writeFile(COOKIES_URI, JSON.stringify(cookies, null, 2));
            console.log('cookies saved')
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = CookiesService;