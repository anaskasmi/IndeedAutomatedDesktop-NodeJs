const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const Moment = require("moment");
const { GraphQLClient, gql } = require("graphql-request");
const { normalizeJobs } = require("../utilities/normalizeJobs");
const saveDraftJobPost = require("./graphQl/mutations/saveDraftJobPost");
const draftJobPostFields = require("./graphQl/fragments/draftJobPostFields");

//models
const Job = require("./../models/Job");
const BrowserService = require("./BrowserService");
const Helpers = require("../utilities/Helpers");
const closeJobMutation = require("./graphQl/mutations/closeJobMutation");
const CookiesService = require("./cookiesService");
const JobsWithIds = require("./graphQl/queries/JobsWithIds");
let JobsServices = {};

JobsServices.openPostJobPage = async () => {
  await BrowserService.page.evaluate(() => window.stop());
  await BrowserService.page.goto(`https://employers.indeed.com/o/p`, {
    waitUntil: "networkidle2",
  });

  // skip hire survey
  if ((await BrowserService.page.url()).includes("hire-survey")) {
    await BrowserService.page.waitForTimeout(2 * 1000);
    let [noOption] = await BrowserService.page.$x(
      `//*[@value="no"]/parent::label`
    );
    if (noOption) {
      await noOption.click();
      await BrowserService.page.waitForTimeout(1000);
      let [otherOption] = await BrowserService.page.$x(
        `//*[@name="other"]/parent::label`
      );
      if (otherOption) {
        await otherOption.click();
        let [continueButton] = await BrowserService.page.$x(
          `//*[@type="submit"]`
        );
        if (continueButton) await continueButton.click();
      }
    }
  }

  // chose new job posting
  await BrowserService.page.waitForTimeout(2 * 1000);
  let [newJobPostingOption] = await BrowserService.page.$x(
    `//*[@data-testid="JOBPOSTING_STARTNEW"]/parent::label`
  );
  if (newJobPostingOption) {
    await newJobPostingOption.click();
    let [continueButton] = await BrowserService.page.$x(`//*[@type="submit"]`);
    if (continueButton) await continueButton.click();
  }

  //reset filled values
  await BrowserService.page.waitForTimeout(2 * 1000);
  let [resetButton] = await BrowserService.page.$x(
    `//*[text()='Reset']/parent::button`
  );
  if (resetButton) {
    await resetButton.click();
  }
};

JobsServices.fetchJobDataByIDFromAPI = async (jobId) => {
  const headers = await CookiesService.getHeaders();
  const CSRFToken = await CookiesService.getCSRFToken();
  let response = await fetch(
    `https://employers.indeed.com/j/jobs/view?id=${jobId}&indeedcsrftoken=${CSRFToken}`,
    {
      headers: {
        ...headers,
        "x-indeed-rpc": "1",
      },
    }
  );

  return response.json();
};

JobsServices.saveCookies = async () => {
  if (!BrowserService.page) {
    await BrowserService.getNewBrowser();
  }
  if (!fs.existsSync("cookies")) {
    fs.mkdirSync("cookies");
  }
  const COOKIES_URI = path.join("cookies", "cookies.json");
  const cookies = await BrowserService.page.cookies();
  fs.writeFileSync(COOKIES_URI, JSON.stringify(cookies, null, 2));
};

JobsServices.downloadCookies = async () => {
  const cookies = await BrowserService.page.cookies();
  await fs.writeFile(
    path.join("cookies", "cookies.json"),
    JSON.stringify(cookies, null, 2),
    function (err, result) {
      if (err) console.log("error in saving cookies", err);
    }
  );
};

JobsServices.scrapAllJobsLegacy = async () => {
  const headers = await CookiesService.getHeaders();
  const CSRFToken = await CookiesService.getCSRFToken();
  let response = await fetch(
    `https://employers.indeed.com/plugin/icjobsmanagement/api/jobs?page=1&pageSize=50&sort=DATECREATED&order=DESC&status=ACTIVE%2CPAUSED&draftJobs=true&hostedCampaigns=1&indeedcsrftoken=${CSRFToken}`,
    {
      headers: {
        ...headers,
      },
      body: null,
      method: "GET",
    }
  );

  const data = await response.json();
  console.log("Jobs Found : " + data.jobs.length);
  let normalizedJobs = await normalizeJobs(data.jobs);
  await Job.deleteMany({});
  await Job.insertMany(normalizedJobs.reverse());
};

JobsServices.getAllJobsFromDb = async () => {
  return Job.find();
};

JobsServices.getJobDataFromDb = async (jobId) => {
  return Job.findOne({
    job_id: jobId,
  });
};

JobsServices.skipDuplicateJobPage = async () => {
  await BrowserService.page.waitForTimeout(2000);
  let [createNewJobOption] = await BrowserService.page.$x(
    `//*[@data-testid="create-new-job"]/parent::label`
  );
  if (createNewJobOption) {
    await createNewJobOption.click();
    const [submit] = await BrowserService.page.$x(
      `//*[@type="submit"]/parent::div`
    );
    if (submit) {
      await submit.click({ clickCount: 3 });
      await BrowserService.page.waitForTimeout(3000);
    }
  }
};

JobsServices.fillIn_JobTitle = async (jobTitle) => {
  await BrowserService.page.waitForXPath(`//*[@data-testid="job-title"]`);
  let [jobTitleInput] = await BrowserService.page.$x(
    `//*[@data-testid="job-title"]`
  );
  await jobTitleInput.click({ clickCount: 3 });
  await jobTitleInput.press("Backspace");
  await jobTitleInput.type(jobTitle);
};

JobsServices.fillIn_JobCategory = async () => {
  //wait for 3 seconds to make sure that category exists
  await BrowserService.page.waitForTimeout(3 * 1000);
  let [firstChoice] = await BrowserService.page.$x(
    `//*[@name="jobOccupationOption"]/label`
  );
  if (firstChoice) {
    await firstChoice.click();
  }
};

JobsServices.fillIn_industry = async () => {
  //wait for 3 seconds to make sure that the industry input exists
  await BrowserService.page.waitForTimeout(3 * 1000);
  let [select] = await BrowserService.page.$x(
    `//*[@advertisercompanymetadataindustry]`
  );
  if (select) {
    await select.click();
    await BrowserService.page.waitForTimeout(1 * 1000);
    let [RestaurantsOption] = await BrowserService.page.$x(
      `//*[contains(@label,"Restaurants & Food")]`
    );
    await RestaurantsOption.click();
  }
};

JobsServices.fillIn_location = async (data) => {
  // open the location options
  await BrowserService.page.waitForXPath(
    `//*[@data-testid="role-location-input"]`
  );
  const [locationOption] = await BrowserService.page.$x(
    `//*[@data-testid="role-location-input"]`
  );
  await locationOption.click();
  await BrowserService.page.waitForTimeout(1 * 1000);
  // choose In person
  const [generalLocation] = await BrowserService.page.$x(
    `//*[contains(text(),'General location')]`
  );
  if (generalLocation) {
    await generalLocation.click();
  }

  // location input
  await BrowserService.page.waitForXPath(
    `//*[@name="local.location.autocomplete-on-the-road"]`
  );
  const [locationInput] = await BrowserService.page.$x(
    `//*[@name="local.location.autocomplete-on-the-road"]`
  );
  await locationInput.type(data.location);
  await locationInput.type(" ");
  await BrowserService.page.waitForTimeout(1000);
  await BrowserService.page.keyboard.press("ArrowDown");
  await BrowserService.page.waitForTimeout(1000);
  await BrowserService.page.keyboard.press("Enter");
  await BrowserService.page.waitForTimeout(5 * 1000);
};

JobsServices.clickSaveAndContinue = async () => {
  const [saveAndContinue] = await BrowserService.page.$x(`//*[@type="submit"]`);

  if (saveAndContinue) {
    await saveAndContinue.click({ clickCount: 3 });
    await BrowserService.page.waitForTimeout(3000);
    // skip duplicate job page
    await JobsServices.skipDuplicateJobPage();
  } else {
    console.log("Error : cant find save button...");
  }
};

JobsServices.fillIn_isJobFullTimeOrPartTime = async (type) => {
  if (type == "PARTTIME") {
    await BrowserService.page.waitForXPath(`//*[text()='Part-time']`);
    let [PartTimeRadioButton] = await BrowserService.page.$x(
      `//*[text()='Part-time']`
    );
    await PartTimeRadioButton.click();
    // disabling full time
    await BrowserService.page.waitForXPath(`//*[text()='Full-time']`);
    let [fullTimeRadioButton] = await BrowserService.page.$x(
      `//*[text()='Full-time']`
    );
    await fullTimeRadioButton.click();
  }
};

JobsServices.expandAllSections = async () => {
  // click all more buttons
  await BrowserService.page.waitForTimeout(1000);
  let moreButtons = await BrowserService.page.$x(
    `//button[contains(text(),"more")]`
  );
  for (const moreButton of moreButtons) {
    await moreButton.click();
  }
};

JobsServices.fillIn_schedule = async () => {
  await JobsServices.expandAllSections();
  await BrowserService.page.waitForTimeout(3000);
  let otherOptions = await BrowserService.page.$x(`//*[text()="Other"]`);
  if (otherOptions.length > 0) {
    for (const otherOption of otherOptions) {
      await otherOption.click();
    }
  } else {
    let noneOptions = await BrowserService.page.$x(`//*[text()="None"]`);
    if (noneOptions.length) {
      for (const noneOption of noneOptions) {
        await noneOption.click();
      }
    }
  }
};

JobsServices.fillIn_hiresNumber = async (hiresNeeded) => {
  if (hiresNeeded > 0 && hiresNeeded <= 10) {
    await BrowserService.page.select(
      '[data-testid="job-hires-needed"]',
      hiresNeeded
    );
  } else {
    await BrowserService.page.select(
      '[data-testid="job-hires-needed"]',
      "TEN_PLUS"
    );
  }
};

JobsServices.fillIn_deadline = async (expectedHireDate) => {
  await BrowserService.page.select(
    '[data-testid="job-expected-hire-date"]',
    expectedHireDate
  );
  let [noCallsOption] = await BrowserService.page.$x(
    `//*[@data-testid="opt-out-option"]/parent::div`
  );
  if (noCallsOption) {
    await noCallsOption.click();
  }
};

JobsServices.fillInputField = async (selector, value) => {
  const inputElement = await BrowserService.page.$x(selector);
  if (inputElement && value !== undefined) {
    await inputElement[0].click({ clickCount: 3 });
    await inputElement[0].press("Backspace");
    await inputElement[0].type(value);
  }
};

JobsServices.fillIn_salary = async (salary) => {
  const selectOptions = {
    salaryRange: {
      RANGE: "Range",
      STARTING_AT: "Starting amount",
      UP_TO: "Maximum amount",
      EXACT_RATE: "Exact amount",
    },
    salaryPeriod: {
      HOUR: "per hour",
      DAY: "per day",
      WEEK: "per week",
      MONTH: "per month",
      YEAR: "per year",
    },
  };

  const selectLabel = "Show pay by";
  const rateLabel = "Rate";

  const selectValue = selectOptions.salaryRange[salary.salaryRange];
  const rateValue = selectOptions.salaryPeriod[salary.salaryPeriod];

  if (selectValue) {
    await JobsServices.clickSelect(selectLabel, selectValue);
  }

  if (rateValue) {
    await JobsServices.clickSelect(rateLabel, rateValue);
  }

  if (salary.salaryRange === "UP_TO") {
    await JobsServices.fillInputField('//*[@id="local.temp-salary.minimum"]', salary.maxSalary);
  } else if (["STARTING_AT", "EXACT_RATE"].includes(salary.salaryRange)) {
    await JobsServices.fillInputField('//*[@id="local.temp-salary.minimum"]', salary.minSalary);
  } else if (salary.salaryRange === "RANGE") {
    await JobsServices.fillInputField('//*[@id="local.temp-salary.minimum"]', salary.minSalary);
    await JobsServices.fillInputField('//*[@id="local.temp-salary.maximum"]', salary.maxSalary);
  }

  return true;
};




JobsServices.clickSelect = async (label, value) => {
  const [selectButton] = await BrowserService.page.$x(
    `//*[text()='${label}']/following-sibling::*`
  );
  await selectButton.click();
  await BrowserService.page.waitForTimeout(1 * 1000);
  if (selectButton) {
    const [selectChoice] = await BrowserService.page.$x(
      `//*[text()='${value}']`
    );
    await selectChoice.click();
  }
};
JobsServices.fillIn_paymentFrom = async (minSalary) => {
  let [jobSalary1] = await BrowserService.page.$x(
    `//*[@id="local.temp-salary.minimum"]`
  );
  if (jobSalary1 && minSalary) {
    await jobSalary1.click({ clickCount: 3 });
    await jobSalary1.press("Backspace");
    await jobSalary1.type(minSalary);
    return true;
  } else if (!minSalary) {
    await jobSalary1.click({ clickCount: 3 });
    await jobSalary1.press("Backspace");
  } else {
    return false;
  }
};

JobsServices.fillIn_benefits = async (benefits) => {
  if (!benefits || benefits.length == 0) return;

  await JobsServices.expandAllSections();

  //   deselect suggestions
  let suggestions = await BrowserService.page.$x(
    `(//*[starts-with(@id, 'taxonomyAttributes.35828bc2-d934-48c2-a22d-0c8356cd07cc-content-')])[1]//li/div`
  );
  for (const suggestion of suggestions) {
    await BrowserService.page.waitForTimeout(100);
    await suggestion.click();
  }

  for (const benefit of benefits) {
    if (benefit === "Other") {
      let [benefitButton] = await BrowserService.page.$x(
        `//*[@data-testid="taxonomyAttributes.35828bc2-d934-48c2-a22d-0c8356cd07cc-content"]//label[contains(., 'Other')]`
      );
      if (benefitButton) {
        await benefitButton.click();
      }
      continue;
    }
    let benefitButton;

    // Try to click the chip that exactly matches the benefit
    [benefitButton] = await BrowserService.page.$x(
      `//*[@data-testid="taxonomyAttributes.35828bc2-d934-48c2-a22d-0c8356cd07cc-content"]//*[text() =  '${benefit}']`
    );

    // If the exact match doesn't exist, click the chip containing the benefit word
    if (!benefitButton) {
      [benefitButton] = await BrowserService.page.$x(
        `//*[@data-testid="taxonomyAttributes.35828bc2-d934-48c2-a22d-0c8356cd07cc-content"]//*[contains(text(), '${benefit}')]`
      );
    }

    // If a matching chip is found, click it
    if (benefitButton) {
      await benefitButton.click();
    }
  }
};

JobsServices.fillIn_paymentTo = async (maxSalary, salaryRange) => {
  let jobSalaryInput;
  if (salaryRange == "UP_TO") {
    [jobSalaryInput] = await BrowserService.page.$x(
      `//*[@id="local.temp-salary.minimum"]`
    );
  } else {
    [jobSalaryInput] = await BrowserService.page.$x(
      `//*[@id="local.temp-salary.maximum"]`
    );
  }
  if (jobSalaryInput && maxSalary) {
    await jobSalaryInput.click({ clickCount: 3 });
    await jobSalaryInput.press("Backspace");
    await jobSalaryInput.type(maxSalary);
    return true;
  } else if (!maxSalary) {
    await jobSalaryInput.click({ clickCount: 3 });
    await jobSalaryInput.press("Backspace");
  } else {
    return false;
  }
};

JobsServices.fillIn_description = async (description) => {
  const jobId = (await BrowserService.page.url()).split("jobId=")[1];

  const mutation = gql`
    ${draftJobPostFields}
    ${saveDraftJobPost}
  `;

  const variables = {
    input: {
      id: jobId,
      patch: {
        description: description.toString(),
      },
    },
  };
  const headers = await CookiesService.getHeaders();
  const client = new GraphQLClient(
    "https://apis.indeed.com/graphql?locale=en-US&co=US",
    {
      headers: {
        ...headers,
        "indeed-client-sub-app": "job-posting",
        "indeed-client-sub-app-component": "./JobDescriptionSheet",
      },
    }
  );
  await client.request(mutation, variables);
  await BrowserService.page.reload();
  await BrowserService.page.waitForTimeout(2000);
};

JobsServices.scrapAllJobs = async () => {
  const variables = {
    input: {
      limit: 50,
      filter: {
        claimed: false,
        createdOnIndeed: true,
        isEditable: true,
        allOf: [
          {
            anyOf: [
              {
                not: {
                  hostedJobStatus: ["CLOSED", "PAUSED"],
                },
              },
              {
                hostedJobStatus: ["PAUSED"],
              },
            ],
          },
        ],
      },
      sort: [
        {
          sortField: "datePostedOnIndeed",
          sortDirection: "DESC",
        },
      ],
    },
    hqm_employer_on_by_default1: false,
  };
  const headers = await CookiesService.getHeaders();
  const client = new GraphQLClient(
    "https://apis.indeed.com/graphql?locale=en-US&co=US",
    {
      headers: {
        ...headers,
        "indeed-client-sub-app": "job-posting",
        "indeed-client-sub-app-component": "./JobDescriptionSheet",
      },
    }
  );
  let data = await client.request(JobsWithIds, variables);
  let normalizedJobs = await normalizeJobs(data.findEmployerJobs.results);
  await Job.deleteMany({});
  await Job.insertMany(normalizedJobs.reverse());
};

JobsServices.fillIn_isResumeRequired = async () => {
  let [resumeRequiredMenu] = await BrowserService.page.$x(
    `//*[text()='Ask potential candidates for a resume?']/following-sibling::button`
  );
  await resumeRequiredMenu.click();

  await BrowserService.page.waitForXPath(`//*[text()='Yes, require a resume']`);
  let [resumeRequiredButton] = await BrowserService.page.$x(
    `//*[text()='Yes, require a resume']`
  );
  await resumeRequiredButton.click();
  return true;
};

JobsServices.click_confirm = async () => {
  await BrowserService.page.waitForTimeout(3000);
  let [confirmButton] = await BrowserService.page.$x(
    `//*[text()='Confirm']/parent::button`
  );
  if (confirmButton) {
    await confirmButton.click();
  } else {
    await BrowserService.page.waitForTimeout(3000);
    [confirmButton] = await BrowserService.page.$x(
      `//*[text()='Confirm']/parent::button`
    );
    if (confirmButton) {
      await confirmButton.click();
    }
  }
};

JobsServices.click_skip = async () => {
  await BrowserService.page.waitForTimeout(3000);
  let [skipButton] = await BrowserService.page.$x(
    `//*[text()='Skip']/parent::button`
  );
  if (skipButton) {
    await skipButton.click();
  } else {
    await BrowserService.page.waitForTimeout(5000);
    [skipButton] = await BrowserService.page.$x(
      `//*[text()='Skip']/parent::button`
    );
    if (skipButton) {
      await skipButton.click();
    }
  }
};
JobsServices.skip_preview_page = async () => {
  await JobsServices.click_confirm();
  await JobsServices.click_skip();
};
JobsServices.review_potential_matches = async () => {
  await BrowserService.page.waitForXPath(`//button[@value="MAYBE"]`);
  for (let index = 1; index <= 4; index++) {
    const maybeButtons = await BrowserService.page.$x(
      `//button[@value="MAYBE"]`
    );
    await maybeButtons[index].click();
    await BrowserService.page.waitForTimeout(500);
  }
  let [submitButton] = await BrowserService.page.$x(`//button[@type="submit"]`);
  await submitButton.click();
};

JobsServices.skip_qualifications = async () => {
  await BrowserService.page.waitForXPath(`//*[text()='Skip']/parent::button`);
  let [skipButton] = await BrowserService.page.$x(
    `//*[text()='Skip']/parent::button`
  );
  await skipButton.click();
};

JobsServices.click_advanced = async () => {
  await BrowserService.page.waitForXPath(
    `//*[text()='Advanced']/parent::button`
  );
  let [budgetAdvancedButton] = await BrowserService.page.$x(
    `//*[text()='Advanced']/parent::button`
  );
  await budgetAdvancedButton.click();
};

JobsServices.fillIn_adDurationType = async () => {
  await BrowserService.page.waitForXPath(`//*[@id="adEndDateSelect"]`);
  await BrowserService.page.select(`#adEndDateSelect`, "CUSTOM");
};

JobsServices.fillIn_adDurationDate = async () => {
  //generate new date after X given days
  let newEndDate = Moment(Moment()).add(1, "days");
  // change its Format
  newEndDate = newEndDate.format("MM/DD/YYYY");

  //fill in the input
  let [endDateInput] = await BrowserService.page.$x(
    `//*[@data-at="end-date-picker"]/div/div/div/span/input`
  );
  await endDateInput.click({ clickCount: 3 });
  await BrowserService.page.keyboard.type(newEndDate);

  //second time
  for (let index = 0; index < 30; index++) {
    await endDateInput.press("Backspace");
  }
  await BrowserService.page.keyboard.type(newEndDate);
};

JobsServices.fillIn_CPC = async (budget_maxCPC) => {
  await BrowserService.page.waitForXPath(`//*[@id="maxcpc"]`);
  let [maxCPC] = await BrowserService.page.$x(`//*[@id="maxcpc"]`);
  if (budget_maxCPC) {
    await maxCPC.click({ clickCount: 3 });
    await maxCPC.press("Backspace");
    await maxCPC.type(budget_maxCPC);
  }
};

JobsServices.fillIn_webSite = async () => {
  await BrowserService.page.waitForXPath(`//*[@name="CO_WEBSITE"]`);
  let [websiteInput] = await BrowserService.page.$x(`//*[@name="CO_WEBSITE"]`);
  if (websiteInput) {
    await websiteInput.click({ clickCount: 3 });
    await websiteInput.press("Backspace");
    await websiteInput.type("https://jobs.crelate.com/portal/misenplace");
  }
};

JobsServices.fillIn_adBudget = async (budget) => {
  await BrowserService.page.select(`select#adEndDateSelect`, "CUSTOM");

  let [budgetValueInput] = await BrowserService.page.$x(`//*[@id="budget"]`);
  if (budgetValueInput && budget) {
    // add budget value
    let budgetInDollar = Math.ceil(budget).toString();
    await budgetValueInput.click({ clickCount: 3 });
    await budgetValueInput.press("Backspace");
    await budgetValueInput.type(budgetInDollar);

    // second time : add budget value
    await BrowserService.page.waitForTimeout(1 * 1000);
    await budgetValueInput.click({ clickCount: 3 });
    await budgetValueInput.press("Backspace");
    await budgetValueInput.type(budgetInDollar);

    // add budget Period
    await BrowserService.page.select(`select#budgetPeriod`, "DAILY");
    let [urgentlyHiringCheckbox] = await BrowserService.page.$x(
      `//*[@name="urgentlyHiringCheckbox"]/parent::label`
    );
    if (urgentlyHiringCheckbox) {
      await urgentlyHiringCheckbox.click();
    }

    return true;
  } else {
    return false;
  }
};

JobsServices.closeJob = async (jobId) => {
  const variables = {
    id: jobId,
    status: "DELETED",
  };
  const headers = await CookiesService.getHeaders();
  const client = new GraphQLClient(
    "https://apis.indeed.com/graphql?locale=en-US&co=US",
    {
      headers: {
        ...headers,
      },
    }
  );
  try {
    await client.request(closeJobMutation, variables);
    await BrowserService.page.waitForTimeout(2000);
    await BrowserService.page.goto("https://employers.indeed.com/jobs");
    await BrowserService.page.waitForTimeout(2000);
    await BrowserService.page.goto("https://employers.indeed.com/jobs");
  } catch (error) {
    console.log(error);
    console.log("Job closing failed !");
  }
};

JobsServices.fillIn_email = async (email) => {
  //fill in the email input
  await BrowserService.page.waitForXPath(`//*[@type="email"]`);
  let [emailInput] = await BrowserService.page.$x(`//*[@type="email"]`);
  await emailInput.click({ clickCount: 3 });
  await emailInput.press("Backspace");
  await Helpers.clearInput();
  await emailInput.type(email);
  await BrowserService.page.waitForTimeout(2000);
  let [optOutInput] = await BrowserService.page.$x(
    `//*[@data-testid="opt-out-option"]`
  );
  if (optOutInput) {
    await optOutInput.click({ clickCount: 3 });
  }
};

JobsServices.close_questions = async () => {
  await BrowserService.page.waitForTimeout(2000);
  let xButtons = await BrowserService.page.$x(
    `//*[contains(@id,'CloseButton')]`
  );
  for (const xButton of xButtons) {
    await xButton.click();
  }
  // unselect phone screen
  let [phoneScreenCheckBox] = await BrowserService.page.$x(
    `//*[@data-testid="custom-phone-screen"]//label`
  );
  await phoneScreenCheckBox.click();

  let [submitButton] = await BrowserService.page.$x(`//button[@type="submit"]`);
  await submitButton.click();
};

JobsServices.fillIn_isJobRemote = async () => {
  await BrowserService.page.waitForXPath(`//*[@for="radio-work_remotely-NO"]`);
  let [noButton] = await BrowserService.page.$x(
    `//*[@for="radio-work_remotely-NO"]`
  );
  await noButton.click();
  await BrowserService.page.waitForTimeout(200);
  await noButton.click();
};
JobsServices.fillIn_otherBenefits = async () => {};

module.exports = JobsServices;
