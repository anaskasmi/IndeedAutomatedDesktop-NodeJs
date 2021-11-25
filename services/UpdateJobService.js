const BrowserService = require('./BrowserService');
const Helpers = require('../utilities/Helpers');
const Moment = require('moment');

let UpdateJobService = {};


UpdateJobService.updateJob = async(data) => {

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


}

UpdateJobService.updateDescriptionSection = async(id, description) => {
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/preview-job?id=${id}`, { waitUntil: 'load' });

    //visite the description  page
    await BrowserService.page.waitForXPath(`//*[@data-tn-element="descriptionEditLink"]`);
    let [descriptionLink] = await BrowserService.page.$x(`//*[@data-tn-element="descriptionEditLink"]`);
    await descriptionLink.click();
    await BrowserService.page.waitForXPath(`//*[@id="JobDescription-editor-content"]`);

    //fill in the description
    await BrowserService.page.$eval('#JobDescription-editor-content', (el, description) => { el.innerHTML = description }, description);

    //type space to apply changements
    let [descriptionInput] = await BrowserService.page.$x(`//*[@id="JobDescription-editor-content"]`);
    await descriptionInput.type(' ')

    //click update button
    await Helpers.clickUpdateOrContinue();
    await BrowserService.page.waitForTimeout(3 * 1000);

    //click confirm 
    try {
        await Helpers.clickConfirm();
        await BrowserService.page.waitForTimeout(2 * 1000);
    } catch (error) {
        console.log('error : confirm not found, after updating the description')
    }

}


UpdateJobService.updateSponsorJobSection = async(id, budget_amount, budget_maxCPC, budgetEndDate) => {
    //if no data was provided return 
    if (!budget_amount && !budget_maxCPC && !budgetEndDate) {
        return;
    }


    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/preview-job?id=${id}`, { waitUntil: 'load' });
    //wait for page to load
    await BrowserService.page.waitForXPath(`//*[@data-tn-element="locationEditLink"]`);


    //go to the budget page


    let [budgetEditLink] = await BrowserService.page.$x(`//*[@data-tn-element="budgetEditLink"]`);
    let [createBudgetLink] = await BrowserService.page.$x(`//*[@id="edit-budget-in-preview"]`);
    if (budgetEditLink) {
        await budgetEditLink.click();
    } else if (createBudgetLink) {
        await createBudgetLink.click();
    } else {
        console.log('edit budget link not found');
        throw 'Edit budget link not found!';
    }

    await BrowserService.page.waitForXPath(`//*[@id="ADVANCED"]`);

    //click advanced
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


        let [endDateInput] = await BrowserService.page.$x(`//*[starts-with(@id,"endDateContainer")]/input`);
        await endDateInput.click({ clickCount: 3 });
        for (let index = 0; index < 30; index++) {
            await endDateInput.press('Backspace');
        }
        await BrowserService.page.keyboard.type(budgetEndDate)
            //second time
        for (let index = 0; index < 30; index++) {
            await endDateInput.press('Backspace');
        }
        await BrowserService.page.keyboard.type(budgetEndDate)
            //third time
        for (let index = 0; index < 30; index++) {
            await endDateInput.press('Backspace');
        }
        await BrowserService.page.keyboard.type(budgetEndDate)



    }

    //click save and continue button
    await BrowserService.page.waitForXPath(`//*[text()='Save and continue']`);
    let [saveAndContinueButton] = await BrowserService.page.$x(`//*[text()='Save and continue']`);
    await saveAndContinueButton.click();
    await BrowserService.page.waitForTimeout(7 * 1000);

    //click confirm 
    try {
        await Helpers.clickConfirm();
        await BrowserService.page.waitForTimeout(4 * 1000);
    } catch (error) {
        console.log('error : confirm not found, after updating the sponsor page')
    }



}



module.exports = UpdateJobService;