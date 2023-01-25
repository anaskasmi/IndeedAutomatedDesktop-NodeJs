//dependencies
require('dotenv').config();

//services
const JobsServices = require('../services/jobsServices');
const BrowserService = require('../services/BrowserService');


let JobsController = {};

JobsController.getNewBrowser = async function(req, res) {
    try {

        await BrowserService.getNewBrowser();
        return res.status(200).json({ 'msg': "opened successfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });

    }
}

JobsController.downloadCookies = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.downloadCookies()
        return res.status(200).json({ "msg": "Cookies downloaded successfully", "cookiesDownloaded": true });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}



JobsController.scrapAllJobs = async(req, res) => {
    req.setTimeout(0);
    try {
        let jobs = await JobsServices.scrapAllJobs();
        return res.status(200).json({ "msg": "jobs scraped successfully", "jobs": jobs });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }

}
JobsController.getJobDataFromDb = async(req, res) => {
    req.setTimeout(0);
    try {
        let jobId = req.params.id;
        let job = await JobsServices.getJobDataFromDb(jobId);
        return res.status(200).json({ "msg": "success", "job": job });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }

}
JobsController.getAllJobsFromDb = async(req, res) => {
    req.setTimeout(0);
    try {
        let jobs = await JobsServices.getAllJobsFromDb();
        return res.status(200).json({ "msg": "jobs served successfuully", "jobs": jobs });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

}


JobsController.getJobFullDetails = async(req, res) => {
    req.setTimeout(0);
    try {
        let job = await JobsServices.getJobFullDetails(req.body.job_id);
        return res.status(200).json({ "msg": "job full details scraped successfully", "job": job });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }
}


JobsController.openPostJobPage = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.openPostJobPage();
        return res.status(200).json({ "msg": "page opened successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.unlockCompanyNameInput = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.unlockCompanyNameInput();
        return res.status(200).json({ "msg": "company name input unlocked" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_CompanyName = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_CompanyName(req.body.companyName);
        return res.status(200).json({ "msg": "company name filled In successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_JobTitle = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_JobTitle(req.body.jobTitle);
        return res.status(200).json({ "msg": "job title filled In successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_JobCategory = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_JobCategory();
        return res.status(200).json({ "msg": "job title filled In successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
JobsController.fillIn_industry = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_industry();
        return res.status(200).json({ "msg": "Industry filled In successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_location = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_location({ location: req.body.location });
        return res.status(200).json({ "msg": "roles location filled In locationsuccessfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


JobsController.fillIn_IsJobremote = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillInRolesLocation();
        return res.status(200).json({ "msg": "roles location filled In successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.clickSaveAndContinue = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.clickSaveAndContinue();
        return res.status(200).json({ "msg": "button save and contiue clicked successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_isJobFullTimeOrPartTime = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_isJobFullTimeOrPartTime(req.body.jobDetails_WhatTypeOfJobIsIt);
        return res.status(200).json({ "msg": "button save and contiue clicked successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_additionalJobTypes = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_additionalJobTypes();
        return res.status(200).json({ "msg": "additional types filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_schedule = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_schedule();
        return res.status(200).json({ "msg": "schedule filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_hiresNumber = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_hiresNumber(req.body.jobDetails_intHiresNeeded);
        return res.status(200).json({ "msg": "Hires Number filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_deadline = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_deadline(req.body.jobDetails_expectedHireDate);
        return res.status(200).json({ "msg": "deadline filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


JobsController.fillIn_paymentType = async(req, res) => {
    req.setTimeout(0);
    try {
        if (await JobsServices.fillIn_paymentType(req.body.jobDetails_salaryRangeType, req.body.jobDetails_SalaryFrom, req.body.jobDetails_SalaryTo))
            return res.status(200).json({ "msg": "payment type filled in successfully", 'paymentTypeFound': true });
        else {
            return res.status(200).json({ "msg": "payment type not filled !", 'paymentTypeFound': false });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_paymentFrom = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_paymentFrom(req.body.jobDetails_SalaryFrom);
        return res.status(200).json({ "msg": "payment FROM, filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_paymentTo = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_paymentTo(req.body.jobDetails_SalaryTo, req.body.jobDetails_salaryRangeType);
        return res.status(200).json({ "msg": "payment To, filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
JobsController.fillIn_salaryFromAndTo = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_salaryFromAndTo(req.body.jobDetails_SalaryFrom, req.body.jobDetails_SalaryTo, req.body.jobDetails_salaryRangeType);
        return res.status(200).json({ "msg": "payment salary, filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_paymentPer = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_paymentPer(req.body.jobDetails_SalaryPer);
        return res.status(200).json({ "msg": "payment Per, filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_description = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_description(req.body.jobDescription);
        return res.status(200).json({ "msg": "description filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
JobsController.fillIn_isResumeRequired = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_isResumeRequired();
        return res.status(200).json({ "msg": "is Resume Required, filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.click_confirm = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.click_confirm();
        return res.status(200).json({ "msg": "clicked confirm, successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
JobsController.skip_preview_page = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.skip_preview_page();
        return res.status(200).json({ "msg": "skipped preview page, successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.click_skip = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.click_skip();
        return res.status(200).json({ "msg": "clicked skip, successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.click_advanced = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.click_advanced();
        return res.status(200).json({ "msg": "clicked advanced successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_adDurationType = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_adDurationType();
        return res.status(200).json({ "msg": "duration type, filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_adDurationDate = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_adDurationDate();
        return res.status(200).json({ "msg": "duration date, filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_CPC = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_CPC(req.body.budget_maxCPC);
        return res.status(200).json({ "msg": "CPC filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_adBudget = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_adBudget(req.body.budget);
        return res.status(200).json({ "msg": "ad Budget filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.click_noThanks = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.click_noThanks();
        return res.status(200).json({ "msg": "no Thanks clicked successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.click_notIntersted = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.click_notIntersted();
        return res.status(200).json({ "msg": "Not intersted clicked successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.closeJob = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.closeJob(req.body);
        return res.status(200).json({ "msg": "Job Closed successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_email = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_email(req.body.jobDetails_emails);
        return res.status(200).json({ "msg": "Email Filled In successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_benefits = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_benefits(req.body.benefits);
        return res.status(200).json({ "msg": "benefits Filled In successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.close_questions = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.close_questions();
        return res.status(200).json({ "msg": "Questions closed successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
JobsController.click_skip = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.click_skip();
        return res.status(200).json({ "msg": "Skip clicked successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_isJobRemote = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_isJobRemote();
        return res.status(200).json({ "msg": "Clicked No on is this a remote job successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_otherBenefits = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_otherBenefits();
        return res.status(200).json({ "msg": "Clicked Other in benefits Input successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
JobsController.fillIn_webSite = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_webSite();
        return res.status(200).json({ "msg": "Filled Website Input successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
JobsController.review_potential_matches = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.review_potential_matches();
        return res.status(200).json({ "msg": "done successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.skip_qualifications = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.skip_qualifications();
        return res.status(200).json({ "msg": "done successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = JobsController;