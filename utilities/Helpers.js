const BrowserService = require("../services/BrowserService");

let Helpers = {};
Helpers.clearInput = async() => {
    await BrowserService.page.keyboard.down('Control');
    await BrowserService.page.keyboard.press('KeyA');
    await BrowserService.page.keyboard.up('Control');
    await BrowserService.page.keyboard.press('Backspace');
};


Helpers.clickUpdateOrContinue = async() => {
    [updateButton] = await BrowserService.page.$x(`//*[text()='Update']`);
    [continueButton] = await BrowserService.page.$x(`//*[text()='Continue']`);

    if (updateButton) {
        await updateButton.click({ clickCount: 3 });
    } else if (continueButton) {
        await continueButton.click({ clickCount: 3 });
    }
    await BrowserService.page.waitForTimeout(100);
    //second retry
    try {
        if (updateButton) {
            await updateButton.click({ clickCount: 3 });
        } else if (continueButton) {
            await continueButton.click({ clickCount: 3 });
        }
    } catch (error) {

    }
    await BrowserService.page.waitForTimeout(3000);
};

Helpers.clickConfirm = async() => {
    console.log('click confirm')
    await BrowserService.page.evaluate(() => {
        document.querySelector(`#sheet-next-button`).click()
    });
    await BrowserService.page.waitForTimeout(3000);
};

Helpers.gettingStartedListeners = async(response) => {
    if (response.url().includes('additional-job-details-sheet')) {
        await Helpers.handleAdditionalDetailsPage();
    } else if (response.url().includes('compensation-details')) {
        await Helpers.handleCompensationDetailsPage();
    }
}


Helpers.handleCompensationDetailsPage = async() => {
    console.log('ignoreCompensationDetailsPage');

    //wait for the page to load
    await BrowserService.page.waitForTimeout(1000);

    //click other on the compensation options
    let [OtherCompensation] = await BrowserService.page.$x(`//*[contains(text(),'Other')]/parent::label`);
    if (OtherCompensation) {
        await OtherCompensation.click()
    }
    await BrowserService.page.waitForTimeout(500);

    //click update button
    await Helpers.clickUpdateOrContinue();

};


Helpers.handleAdditionalDetailsPage = async() => {
    console.log('additional-job-details-sheet');
    //click update button
    await Helpers.clickUpdateOrContinue();
};

module.exports = Helpers;