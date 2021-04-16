const BrowserService = require('./BrowserService');
const Helpers = require('../utilities/Helpers');
const Moment = require('moment');

let UpdateJobService = {};



UpdateJobService.openUpdatePage = async(id) => {
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/preview-job?id=${id}`, { waitUntil: 'load' });
}

UpdateJobService.updateGettingStartedSection = async(id, jobTitle, location) => {
    // if no data passed return
    if (!jobTitle && !location.city && !location.state) {
        return;
    }

    //visite the getting started page
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/getting-started?id=${id}`, { waitUntil: 'load' });
    await BrowserService.page.waitForTimeout(2000);

    //update title
    if (jobTitle) {
        console.log('filling the title')
        await BrowserService.page.waitForXPath(`//*[@class="highlightable icl-TextInput-control"]`);
        let [jobTitleInput] = await BrowserService.page.$x(`//*[@class="highlightable icl-TextInput-control"]`);
        //click the job title input
        await jobTitleInput.click();
        //clear input
        await Helpers.clearInput();
        //type the job title
        await BrowserService.page.keyboard.type(jobTitle)
        await BrowserService.page.waitForTimeout(2000);


        //add listeners
        // await BrowserService.page.on('response', Helpers.gettingStartedListeners);



    }

    //update location
    if (location && location.city && location.state) {

        //click one location option
        await BrowserService.page.waitForXPath(`//*[@id="roleLocationTypeRadiosOneLocation"]/following-sibling::div`);
        let [oneLocation] = await BrowserService.page.$x(`//*[@id="roleLocationTypeRadiosOneLocation"]/following-sibling::div`);
        await oneLocation.click({ clickCount: 2 });

        //click don't include street option 
        await BrowserService.page.waitForXPath(`//*[@id="ecl-RadioItem-label-HideExactLocation"]`);
        let [dontIncludeStreetOption] = await BrowserService.page.$x(`//*[@id="ecl-RadioItem-label-HideExactLocation"]`);
        await dontIncludeStreetOption.click({ clickCount: 2 });

        //Fill in city
        await BrowserService.page.waitForXPath(`//*[@id="precise-address-city-input"]`);
        let [cityInput] = await BrowserService.page.$x(`//*[@id="precise-address-city-input"]`);

        if (process.env.TYPING_METHODE == "keyboard") {
            await cityInput.click();
            await Helpers.clearInput();
            await cityInput.type(location.city);
            await BrowserService.page.waitForTimeout(3000);
            await BrowserService.page.keyboard.press('ArrowDown');
            await BrowserService.page.keyboard.press('Enter');
        } else {
            await BrowserService.page.evaluate((locationCity) => {
                document.querySelector(`#precise-address-city-input`).value = locationCity;
            }, location.city);
            await cityInput.type(' ');
            await cityInput.press('Backspace');
            await BrowserService.page.waitForTimeout(3000);
            await BrowserService.page.keyboard.press('ArrowDown');
            await BrowserService.page.keyboard.press('Enter');
        }

        //select state 
        await BrowserService.page.select('[name="region"]', location.state);
        await BrowserService.page.waitForTimeout(2000);

    }

    // save the modifications
    await BrowserService.page.waitForXPath(`//*[@data-tn-element="sheet-next-button"]`);
    let [updateButton] = await BrowserService.page.$x(`//*[@data-tn-element="sheet-next-button"]`);
    await updateButton.click();

    await BrowserService.page.waitForXPath(`//*[contains(text(),'View Preview')]`);
    //click confirm 
    await Helpers.clickConfirm();
}

UpdateJobService.updateDescriptionSection = async(id, description) => {
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/preview-job?id=${id}`, { waitUntil: 'load' });
    await BrowserService.page.waitForXPath(`//*[@id="preview-container"]`);

    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/job-description`, { waitUntil: 'load' });
    await BrowserService.page.waitForXPath(`//*[@id="JobDescription-editor-content"]`);
    await BrowserService.page.$eval('#JobDescription-editor-content', (el, description) => { el.innerHTML = description }, description);

    //type space to apply changements
    let [descriptionInput] = await BrowserService.page.$x(`//*[@id="JobDescription-editor-content"]`);
    await descriptionInput.type(' ')

    //click update button
    await Helpers.clickUpdateOrContinue();

    //validation
    await BrowserService.page.waitForTimeout(3 * 1000);
    let [error] = await BrowserService.page.$x(`//*[@id="plugin_container_CoreFunnel_ValidationPanelContainer"]`);
    if (error) {
        //wait for 3 seconds to make sure that category exists 
        let [firstChoice] = await BrowserService.page.$x(`//*[@name="jobOccupationOption"]/label`)
        if (firstChoice) {
            await firstChoice.click();
        }
        //click update button
        await Helpers.clickUpdateOrContinue();


    }

    //click confirm 
    await Helpers.clickConfirm();

}


UpdateJobService.updateApplicationSettingsSection = async(id) => {
    // await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/preview-job?id=${id}`);
    // await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/application-settings`);
}
UpdateJobService.updateJobDetailsSection = async(id) => {
    // await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/job-details?id=${id}`);
}

UpdateJobService.updateSponsorJobSection = async(id, budget_amount, budget_maxCPC, budgetEndDate) => {
    //if no data was provided return 
    if (!budget_amount && !budget_maxCPC && !budgetEndDate) {
        return;
    }

    await BrowserService.page.goto(`https://employers.indeed.com/p#sponsor?id=${id}&linksource=editjob`);

    //click advanced
    await BrowserService.page.waitForXPath(`//*[@id="ADVANCED"]`);
    let [budgetAdvancedButton] = await BrowserService.page.$x(`//*[@id="ADVANCED"]`);
    await budgetAdvancedButton.click();

    //cpc
    if (budget_maxCPC) {
        await BrowserService.page.waitForXPath(`//*[@id="maxcpc"]`);
        let [maxCPC] = await BrowserService.page.$x(`//*[@id="maxcpc"]`);
        if (budget_maxCPC) {
            await maxCPC.click({ clickCount: 3 });
            await maxCPC.press('Backspace');
            await maxCPC.type(budget_maxCPC);
        }
    }


    //budget 
    if (budget_amount) {
        await BrowserService.page.waitForXPath(`//*[@id="advanced-budget"]`);
        let [budgetInput] = await BrowserService.page.$x(`//*[@id="advanced-budget"]`);
        let budgetInDollar = Math.ceil(budget_amount).toString();
        await budgetInput.click({ clickCount: 3 });
        await budgetInput.press('Backspace');
        await budgetInput.type(budgetInDollar)
    }

    //select custom end date option
    if (budgetEndDate) {

        //enable date input
        await BrowserService.page.evaluate(() => {
            if (document.querySelector(`#setEndDateCheckbox`).value == "false") {

                document.querySelector(`#setEndDateCheckbox`).click()
            }
        });

        //Fill in the end date
        console.log('unformatted end date : ' + budgetEndDate);
        budgetEndDate = Moment(budgetEndDate).format('MM/DD/YYYY');
        console.log('formatted end date : ' + budgetEndDate);
        await BrowserService.page.evaluate((budgetEndDate) => {
            document.querySelector(`[id^=endDateContainer] > input[type=text]`).value = budgetEndDate;
        }, budgetEndDate);
    }

    //click save and continue button
    await BrowserService.page.waitForXPath(`//*[text()='Save and continue']`);
    let [saveAndContinueButton] = await BrowserService.page.$x(`//*[text()='Save and continue']`);
    await saveAndContinueButton.click({ clickCount: 2 });

    //click confirm 
    await Helpers.clickConfirm();



}



module.exports = UpdateJobService;