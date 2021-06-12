const BrowserService = require("../services/BrowserService");

const handleDidYouHirepPopUp = async() => {
    let [noButton] = await BrowserService.page.$x(`//*[@name="did-you-hire-radio" and @value="no"]/parent::label`);
    if (noButton) {
        //*clicking no
        await noButton.click();
        //*clicking continue
        let [continueButton] = await BrowserService.page.$x(`//*[@data-tn-element="sheet-next-button"]`);
        await continueButton.click();
        //*clicking other
        await BrowserService.page.waitForXPath(`//*[@name="other"]/parent::label`);
        await BrowserService.page.evaluate(() => {
            document.querySelector(`[name="other"]`).click();
        });

        //*clicking continue
        [continueButton] = await BrowserService.page.$x(`//*[@data-tn-element="sheet-next-button"]`);
        await continueButton.click();
    }


}

exports.handleDidYouHirepPopUp = handleDidYouHirepPopUp;