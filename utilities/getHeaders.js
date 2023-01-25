const { getCookiesAsText } = require("./getCookiesAsText");

const getHeaders = async() => {
    const cookies = await getCookiesAsText();
    return {
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
}


exports.getHeaders = getHeaders;