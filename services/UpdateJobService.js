const BrowserService = require('./BrowserService');
const Helpers = require('../utilities/Helpers');
const Moment = require('moment');

let UpdateJobService = {};



UpdateJobService.setListeners = async(id) => {

    //add listeners
    await BrowserService.page.on('response',
        async function clickOtherOnCompensationDetailsPage(response) {
            //compensation-details
            if (response.url().includes('compensation-details')) {
                await BrowserService.page.waitForTimeout(2000);
                try {
                    await BrowserService.page.waitForXPath(`//*[contains(text(),'None')]/parent::label`);
                    let noneButton = await BrowserService.page.$x(`//*[contains(text(),'None')]/parent::label`);
                    await noneButton[0].click();
                    await BrowserService.page.waitForTimeout(200);
                    await Helpers.clickConfirm()
                } catch (error) {
                    console.log('clickOtherOnCompensationDetailsPage : ' + error);
                }
                await BrowserService.page.removeListener('response', clickOtherOnCompensationDetailsPage);

            }
        }
    );



}

UpdateJobService.updateGettingStartedSection = async(id, jobTitle, location) => {
    // if no data passed return
    if (!jobTitle && !location.city && !location.state) {
        return;
    }
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/preview-job?id=${id}`, { waitUntil: 'load' });

    //visite the getting started page
    await BrowserService.page.waitForXPath(`//*[@data-tn-element="locationEditLink"]`);
    let [gettingStartedLink] = await BrowserService.page.$x(`//*[@data-tn-element="locationEditLink"]`);
    await gettingStartedLink.click();
    await BrowserService.page.waitForXPath(`//*[@data-test-id="sheet-title"]`);

    //update title
    if (jobTitle) {
        console.log('filling the title')
        await BrowserService.page.waitForXPath(`//*[@class="highlightable icl-TextInput-control"]`);
        let [jobTitleInput] = await BrowserService.page.$x(`//*[@class="highlightable icl-TextInput-control"]`);
        //click the job title input
        await jobTitleInput.click({ clickCount: 3 });
        for (let index = 0; index < 76; index++) {
            await jobTitleInput.press('Backspace');
        }


        //clear input
        // await Helpers.clearInput();
        //type the job title
        await BrowserService.page.keyboard.type(jobTitle)
        await BrowserService.page.waitForTimeout(2000);
    }


    //update location
    if (location && location.city && location.state) {
        await Helpers.makeSureUrlIsGettingStarted();

        //click one location option
        await BrowserService.page.waitForXPath(`//*[@id="roleLocationTypeRadiosOneLocation"]/following-sibling::div`);
        let [oneLocation] = await BrowserService.page.$x(`//*[@id="roleLocationTypeRadiosOneLocation"]/following-sibling::div`);
        await oneLocation.click();

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
    await BrowserService.page.waitForTimeout(6 * 1000);

    try {

        //deal with additional details page
        let [additionalJobDetailsPageExist] = await BrowserService.page.$x(`//*[@for="CO_FBOOK_PAGE"]`)
        if (additionalJobDetailsPageExist) {
            await Helpers.clickConfirm();
            await BrowserService.page.waitForTimeout(3 * 1000);
        }
        //click confirm 
        await Helpers.clickConfirm();
        await BrowserService.page.waitForTimeout(3 * 1000);
    } catch (error) {
        console.log('error : confirm not found, after updating the getting started page')
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


        let [endDateInput] = await BrowserService.page.$x(`//*[@id="endDateContainer-0"]/input`);
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