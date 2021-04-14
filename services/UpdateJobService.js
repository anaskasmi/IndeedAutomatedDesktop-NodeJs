const BrowserService = require('./BrowserService');
const Helpers = require('../utilities/Helpers');

let UpdateJobService = {};



UpdateJobService.openUpdatePage = async(id) => {
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/preview-job?id=${id}`, { waitUntil: 'load' });
}

UpdateJobService.updateGettingStartedSection = async(id, jobTitle, location) => {
    // if no data passed return
    if (!jobTitle && !location) {
        return;
    }

    //visite the getting started page
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/getting-started?id=${id}`, { waitUntil: 'load' });
    await BrowserService.page.waitForTimeout(2000);
    //update title
    if (jobTitle) {
        await BrowserService.page.waitForXPath(`//*[@class="highlightable icl-TextInput-control"]`);
        let [jobTitleInput] = await BrowserService.page.$x(`//*[@class="highlightable icl-TextInput-control"]`);
        //click the job title input
        await jobTitleInput.click();
        //clear input
        await Helpers.clearInput();
        //type the job title
        await BrowserService.page.keyboard.type(jobTitle)
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
        } else {
            await BrowserService.page.evaluate((locationCity) => {
                document.querySelector(`#precise-address-city-input`).value = locationCity;
            }, location.city);
            await cityInput.type(' ');
            await cityInput.press('Backspace');
        }

        //select state 
        await BrowserService.page.select('[name="region"]', location.state);
    }

    //save the modifications
    await BrowserService.page.waitForXPath(`//*[@data-tn-element="sheet-next-button"]`);
    let [updateButton] = await BrowserService.page.$x(`//*[@data-tn-element="sheet-next-button"]`);
    await updateButton.click();

}

UpdateJobService.updateDescriptionSection = async(id, description) => {
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/preview-job?id=${id}`);
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/job-description`);

    await BrowserService.page.waitForXPath(`//*[text()='Job Description']`);
    await BrowserService.page.$eval('#JobDescription-editor-content', (el, jobDescriptionHtml) => { el.innerHTML = jobDescriptionHtml }, jobDescriptionHtml);
    //type space to apply changements
    let [descriptionInput] = await BrowserService.page.$x(`//*[@id="JobDescription-editor-content"]`);
    await descriptionInput.type(' ')

}
UpdateJobService.updateApplicationSettingsSection = async(id) => {
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/preview-job?id=${id}`);
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/application-settings`);
}
UpdateJobService.updateJobDetailsSection = async(id) => {
    await BrowserService.page.goto(`https://employers.indeed.com/p#post-job/job-details?id=${id}`);
}

UpdateJobService.updateSponsorJobSection = async(id, budget, maxCPC, budgetEndDate) => {
    await BrowserService.page.goto(`https://employers.indeed.com/p#sponsor?id=${id}&linksource=editjob`);
}



module.exports = UpdateJobService;