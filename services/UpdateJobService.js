const BrowserService = require('./BrowserService');
const Helpers = require('../utilities/Helpers');
const Moment = require('moment');
const queryString = require('query-string');

let UpdateJobService = {};


UpdateJobService.updateJob = async(data) => {

    // if no budget data was provided return 
    if (!data.jobTitle && !data.location.city && !data.location.state && !data.description) {
        return;
    }


    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/preview-job?id=${data.id}`, { waitUntil: 'load' });

    //wait for header of page to show
    await BrowserService.page.waitForXPath(`//*[@data-testid="sheet-header"]`);

    //update title
    if (data.jobTitle) {
        console.log('filling the title');
        // open the title input
        await BrowserService.page.waitForXPath(`//*[@title="Edit Job title"]`);
        let [jobTitleEditButton] = await BrowserService.page.$x(`//*[@title="Edit Job title"]`);
        await jobTitleEditButton.click();

        // find job title
        await BrowserService.page.waitForXPath(`//*[@data-testid="highlight-overlay"]`);
        let [jobTitleInput] = await BrowserService.page.$x(`//*[@data-testid="highlight-overlay"]`);

        //select all in the job title input
        await jobTitleInput.click({ clickCount: 3 });

        //delete all
        for (let index = 0; index < 76; index++) {
            await jobTitleInput.press('Backspace');
        }

        //type the job title
        await BrowserService.page.keyboard.type(data.jobTitle)
        await BrowserService.page.waitForTimeout(2000);

        // click update
        let [updateTitleButton] = await BrowserService.page.$x(`//*[@data-testid="edit-field-update"]`);
        await updateTitleButton.click();
        await BrowserService.page.waitForTimeout(1000);


    }


    //update location
    if (data.location && data.location.city && data.location.state) {
        console.log('filling the location');
        let fullLocation = data.location.city + ', ' + data.location.state;

        // unlock the location input
        await BrowserService.page.waitForXPath(`//*[@title="Edit Work location"]`);
        let [jobLocationEditButton] = await BrowserService.page.$x(`//*[@title="Edit Work location"]`);
        await jobLocationEditButton.click();

        // chose in one loacation 
        await BrowserService.page.waitForXPath(`//*[@data-testid="ONE_LOCATION"]`);
        let [oneLocationChoice] = await BrowserService.page.$x(`//*[@data-testid="ONE_LOCATION"]/parent::label`);
        await oneLocationChoice.click();

        // chose in one loacation 
        let [dontIncludeAddressChoice] = await BrowserService.page.$x(`//*[@id="remote.draftJobPosts.attributes.workLocationType-OneMileRadius"]`);
        await dontIncludeAddressChoice.click();

        // find address input
        let [addressInput] = await BrowserService.page.$x(`//*[@data-testid="precise-address-city"]`);

        //select all
        await addressInput.click({ clickCount: 3 });

        //delete all
        for (let index = 0; index < 76; index++) {
            await addressInput.press('Backspace');
        }

        //type the new address
        await addressInput.type(fullLocation, { delay: 20 });
        await BrowserService.page.waitForTimeout(3000);
        await BrowserService.page.keyboard.press('ArrowDown');
        await BrowserService.page.keyboard.press('Enter');

        // click somewhere else, to apply changes
        let [zipCodeInput] = await BrowserService.page.$x(`//*[@data-testid="precise-address-city"]`);
        await zipCodeInput.click({ clickCount: 3 });
        await BrowserService.page.waitForTimeout(1000);

        // click update
        let [updateTitleButton] = await BrowserService.page.$x(`//*[@data-testid="edit-field-update"]`);
        await updateTitleButton.click();
        await BrowserService.page.waitForTimeout(1000);

    }


    //update description
    if (data.description) {
        console.log('filling the description');
        // open the description input
        await BrowserService.page.waitForXPath(`//*[@title="Edit Job description"]`);
        let [jobTitleEditButton] = await BrowserService.page.$x(`//*[@title="Edit Job description"]`);
        await jobTitleEditButton.click();

        //start filling the descritpion
        let jobDescriptionHtml = data.description;
        await BrowserService.page.waitForXPath(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'job description')]`);
        await BrowserService.page.$eval('#JobDescription-editor-editor-content', (el, jobDescriptionHtml) => { el.innerHTML = jobDescriptionHtml }, jobDescriptionHtml);

        //click to apply changements
        let [descriptionInput] = await BrowserService.page.$x(`//*[@id="JobDescription-editor-editor-content"]`);
        await descriptionInput.click({ clickCount: 2 });

        // click update
        let [updateTitleButton] = await BrowserService.page.$x(`//*[@data-testid="edit-field-update"]`);
        await updateTitleButton.click();
        await BrowserService.page.waitForTimeout(1000);
    }

    //save changes 
    let [submitButton] = await BrowserService.page.$x(`//*[@type="submit"]`);
    await submitButton.click();
    await BrowserService.page.waitForTimeout(3000);


}

UpdateJobService.updateBudgetSection = async(data) => {
    // if no budget data was provided return 
    if (!data.budgetEndDate && !data.maxCPC && !data.budget) {
        return;
    }

    // get publish ID
    try {
        await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/preview-job?id=${data.id}`, { waitUntil: 'load' });
    } catch (error) {
        await BrowserService.page.waitForTimeout(2000);
        await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/preview-job?id=${data.id}`, { waitUntil: 'load' });
    }

    //wait for header of page to show
    await BrowserService.page.waitForXPath(`//*[@data-testid="sheet-header"]`);

    //parse publish id 
    const url = await BrowserService.page.url()
    const queryObj = queryString.parseUrl(url);
    const publishedId = queryObj.query.publishedId;


    // go to sponsor page
    await BrowserService.page.goto(`https://employers.indeed.com/o/sponsor/edit/?publishedId=${publishedId}&jobId=${data.id}`, { waitUntil: 'load' });
    //wait for header of page to show
    await BrowserService.page.waitForXPath(`//*[@id="gnav-header-end"]`);

    // click advanced
    await BrowserService.page.waitForXPath(`//*[text()='Advanced']/parent::button`);
    let [budgetAdvancedButton] = await BrowserService.page.$x(`//*[text()='Advanced']/parent::button`);
    await budgetAdvancedButton.click();

    // update end date
    if (data.budgetEndDate) {
        //format the end date
        let newEndDate = Moment(data.budgetEndDate).format('MM/DD/YYYY');
        console.log('formatted end date : ' + data.budgetEndDate);

        //activate the set end date checkbox 
        await BrowserService.page.waitForXPath(`//*[@name="budgetShouldSetEndDate"]/parent::label`);
        let [endDateCheckBox] = await BrowserService.page.$x(`//*[@name="budgetShouldSetEndDate"]/parent::label`);
        await endDateCheckBox.click();
        await BrowserService.page.waitForTimeout(500);

        // check if input was shown, click the check box again if not
        let [endDateInput] = await BrowserService.page.$x(`//*[@id="input"]`);
        if (!endDateInput) {
            await endDateCheckBox.click();
            await BrowserService.page.waitForTimeout(500);
            [endDateInput] = await BrowserService.page.$x(`//*[@id="input"]`);
        }

        //fill in the input
        await endDateInput.click({ clickCount: 3 });
        await BrowserService.page.keyboard.type(newEndDate);

        //second time
        for (let index = 0; index < 30; index++) {
            await endDateInput.press('Backspace');
        }
        await BrowserService.page.keyboard.type(newEndDate);

        //third time
        for (let index = 0; index < 30; index++) {
            await endDateInput.press('Backspace');
        }
        await BrowserService.page.keyboard.type(newEndDate);

        //fourth time
        await BrowserService.page.evaluate((newEndDate) => {
            document.querySelector(`#input`).value = newEndDate;
        }, newEndDate);
    }

    // update CPC
    if (data.maxCPC) {
        await BrowserService.page.waitForXPath(`//*[@id="maxcpc"]`);
        let [maxCPC] = await BrowserService.page.$x(`//*[@id="maxcpc"]`);
        await maxCPC.click({ clickCount: 3 });
        await maxCPC.press('Backspace');
        await maxCPC.type(data.maxCPC);
    }

    // update budget
    if (data.budget) {
        await BrowserService.page.waitForXPath(`//*[@id="advanced-budget"]`);
        let [budgetInput] = await BrowserService.page.$x(`//*[@id="advanced-budget"]`);
        let budgetInDollar = Math.ceil(data.budget).toString();
        await budgetInput.click({ clickCount: 3 });
        await budgetInput.press('Backspace');
        await budgetInput.type(budgetInDollar);
    }

    //save changes 
    let [submitButton] = await BrowserService.page.$x(`//*[@data-dd-action-name="sponsored-button"]`);
    await submitButton.click();
    await BrowserService.page.waitForTimeout(3000);

}

module.exports = UpdateJobService;