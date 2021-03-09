//dependencies
require('dotenv').config();

//services
const JobServices = require('../services/jobsServices').JobServices;


exports.JobsController = class JobsController {

    jobServices = null;
    JobsController() {
        jobServices = new JobServices();
    }

    getNewBrowser = async(req, res) => {
        await jobServices.getNewBrowser();
    }

    downloadCookies = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.downloadCookies()
            return res.status(200).json({ "msg": "Cookies downloaded successfully", "cookiesDownloaded": true });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    loadCookies = async(req, res) => {
        req.setTimeout(0);
        try {
            if (await jobServices.loadCookies()) {
                return res.status(200).json({ "msg": "Login page opened successfully", "cookiesLoaded": true });
            } else {
                return res.status(200).json({ "msg": "Cookies did not load ! try to login", "cookiesLoaded": false });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }


    isLoggedIn = async(req, res) => {
        req.setTimeout(0);
        try {
            if (await jobServices.isLoggedIn()) {
                return res.status(200).json({ "msg": "Already Logged In", "loggedIn": true });
            } else {
                return res.status(200).json({ "msg": "Not Logged In! try to login", "loggedIn": false });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    openLoginPage = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.openLoginPage();
            return res.status(200).json({ "msg": "Login page opened successfully" });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }

    }



    scrapAllJobs = async(req, res) => {
        req.setTimeout(0);
        try {
            let jobs = await jobServices.scrapAllJobs();
            return res.status(200).json({ "msg": "jobs scraped successfully", "jobs": jobs });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }

    }


    getJobFullDetails = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.getJobFullDetails();
            return res.status(200).json({ "msg": "job full details scraped successfully", "job": job });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }


    openPostJobPage = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.openPostJobPage();
            return res.status(200).json({ "msg": "page opened successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    unlockCompanyNameInput = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.unlockCompanyNameInput();
            return res.status(200).json({ "msg": "company name input unlocked" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_CompanyName = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillInCompanyName();
            return res.status(200).json({ "msg": "company name filled In successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_JobTitle = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillInJobTitle();
            return res.status(200).json({ "msg": "job title filled In successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_JobCategory = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillInJobCategory();
            return res.status(200).json({ "msg": "job title filled In successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_RolesLocation = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_RolesLocation();
            return res.status(200).json({ "msg": "roles location filled In successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }


    fillIn_IsJobremote = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillInRolesLocation();
            return res.status(200).json({ "msg": "roles location filled In successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    clickSaveAndContinue = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.clickSaveAndContinue();
            return res.status(200).json({ "msg": "button save and contiue clicked successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_isJobFullTimeOrPartTime = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_isJobFullTimeOrPartTime();
            return res.status(200).json({ "msg": "button save and contiue clicked successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_additionalJobTypes = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_additionalJobTypes();
            return res.status(200).json({ "msg": "additional types filled in successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_schedule = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_schedule();
            return res.status(200).json({ "msg": "schedule filled in successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_hiresNumber = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_hiresNumber();
            return res.status(200).json({ "msg": "Hires Number filled in successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_deadline = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_deadline();
            return res.status(200).json({ "msg": "deadline filled in successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }


    fillIn_paymentType = async(req, res) => {
        req.setTimeout(0);
        try {
            if (await jobServices.fillIn_paymentType())
                return res.status(200).json({ "msg": "payment type filled in successfully", 'paymentTypeFound': true });
            else {
                return res.status(200).json({ "msg": "payment type not filled !", 'paymentTypeFound': false });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_paymentFrom = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_paymentFrom();
            return res.status(200).json({ "msg": "payment FROM, filled in successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_paymentTo = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_paymentTo();
            return res.status(200).json({ "msg": "payment To, filled in successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_paymentPer = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_paymentPer();
            return res.status(200).json({ "msg": "payment Per, filled in successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_description = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_description();
            return res.status(200).json({ "msg": "description filled in successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    fillIn_isResumeRequired = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_isResumeRequired();
            return res.status(200).json({ "msg": "is Resume Required, filled in successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    click_confirm = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.click_confirm();
            return res.status(200).json({ "msg": "clicked confirm, successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    click_advanced = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.click_advanced();
            return res.status(200).json({ "msg": "clicked advanced successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_adDurationType = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_adDurationType();
            return res.status(200).json({ "msg": "duration type, filled in successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_adDurationDate = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_adDurationDate();
            return res.status(200).json({ "msg": "duration date, filled in successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_CPC = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_CPC();
            return res.status(200).json({ "msg": "CPC filled in successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    fillIn_adBudget = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.fillIn_adBudget();
            return res.status(200).json({ "msg": "ad Budget filled in successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    click_noThanks = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.click_noThanks();
            return res.status(200).json({ "msg": "no Thanks clicked successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    click_notIntersted = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.click_notIntersted();
            return res.status(200).json({ "msg": "Not intersted clicked successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    closeJob = async(req, res) => {
        req.setTimeout(0);
        try {
            await jobServices.closeJob();
            return res.status(200).json({ "msg": "Job Closed successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

}