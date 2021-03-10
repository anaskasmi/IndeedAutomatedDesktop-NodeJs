//dependencies
require('dotenv').config();

//services
const JobsServices = require('../services/jobsServices');


let JobsController = {};

JobsController.getNewBrowser = async function(req, res) {
    try {
        await JobsServices.getNewBrowser();
        return res.status(200).json({ 'msg': "opened successfully" });
    } catch (error) {
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
        await JobsServices.getJobFullDetails();
        return res.status(200).json({ "msg": "job full details scraped successfully", "job": job });
    } catch (error) {
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
        await JobsServices.fillInCompanyName();
        return res.status(200).json({ "msg": "company name filled In successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_JobTitle = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillInJobTitle();
        return res.status(200).json({ "msg": "job title filled In successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_JobCategory = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillInJobCategory();
        return res.status(200).json({ "msg": "job title filled In successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_RolesLocation = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_RolesLocation();
        return res.status(200).json({ "msg": "roles location filled In successfully" });
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
        await JobsServices.fillIn_isJobFullTimeOrPartTime();
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
        await JobsServices.fillIn_hiresNumber();
        return res.status(200).json({ "msg": "Hires Number filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_deadline = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_deadline();
        return res.status(200).json({ "msg": "deadline filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


JobsController.fillIn_paymentType = async(req, res) => {
    req.setTimeout(0);
    try {
        if (await JobsServices.fillIn_paymentType())
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
        await JobsServices.fillIn_paymentFrom();
        return res.status(200).json({ "msg": "payment FROM, filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_paymentTo = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_paymentTo();
        return res.status(200).json({ "msg": "payment To, filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_paymentPer = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_paymentPer();
        return res.status(200).json({ "msg": "payment Per, filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_description = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_description();
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
        await JobsServices.fillIn_CPC();
        return res.status(200).json({ "msg": "CPC filled in successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

JobsController.fillIn_adBudget = async(req, res) => {
    req.setTimeout(0);
    try {
        await JobsServices.fillIn_adBudget();
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
        await JobsServices.closeJob();
        return res.status(200).json({ "msg": "Job Closed successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = JobsController;