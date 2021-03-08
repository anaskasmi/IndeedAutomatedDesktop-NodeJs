//packages
const express = require('express');
//controllers
const jobsController = require('../controller/jobsController');
//config
const router = express.Router();

let jobsController = new JobsController();


//login routes
router.get('/getNewBrowser', jobsController.getNewBrowser)
router.get('/loadCookies', jobsController.loadCookies)
router.get('/isLoggedIn', jobsController.isLoggedIn)
router.get('/openLoginPage', jobsController.openLoginPage)

//scrap data routes
router.get('/scrapAllJobs', jobsController.scrapAllJobs)
router.get('/getJobFullDetails', jobsController.getJobFullDetails)

//reposting routes
router.get('/openPostJobPage', jobsController.openPostJobPage)
router.get('/unlockCompanyNameInput', jobsController.unlockCompanyNameInput)
router.get('/fillIn_CompanyName', jobsController.fillIn_CompanyName)
router.get('/fillIn_JobTitle', jobsController.fillIn_JobTitle)
router.get('/fillIn_JobCategory', jobsController.fillIn_JobCategory)
router.get('/fillIn_RolesLocation', jobsController.fillIn_RolesLocation)
router.get('/fillIn_IsJobremote', jobsController.fillIn_IsJobremote)
router.get('/clickSaveAndContinue', jobsController.clickSaveAndContinue)
router.get('/fillIn_isJobFullTimeOrPartTime', jobsController.fillIn_isJobFullTimeOrPartTime)
router.get('/fillIn_additionalJobTypes', jobsController.fillIn_additionalJobTypes)
router.get('/fillIn_schedule', jobsController.fillIn_schedule)
router.get('/fillIn_hiresNumber', jobsController.fillIn_hiresNumber)
router.get('/fillIn_deadline', jobsController.fillIn_deadline)
router.get('/fillIn_paymentType', jobsController.fillIn_paymentType)
router.get('/fillIn_paymentFrom', jobsController.fillIn_paymentFrom)
router.get('/fillIn_paymentTo', jobsController.fillIn_paymentTo)
router.get('/fillIn_paymentPer', jobsController.fillIn_paymentPer)
router.get('/fillIn_compensation', jobsController.fillIn_compensation)
router.get('/fillIn_benefits', jobsController.fillIn_benefits)
router.get('/fillIn_description', jobsController.fillIn_description)
router.get('/fillIn_isResumeRequired', jobsController.fillIn_isResumeRequired)
router.get('/click_confirm', jobsController.click_confirm)
router.get('/click_advanced', jobsController.click_advanced)
router.get('/fillIn_adDurationType', jobsController.fillIn_adDurationType)
router.get('/fillIn_adDurationDate', jobsController.fillIn_adDurationDate)
router.get('/fillIn_CPC', jobsController.fillIn_CPC)
router.get('/fillIn_adBudget', jobsController.fillIn_adBudget)
router.get('/click_noThanks', jobsController.click_noThanks)
router.get('/click_notIntersted', jobsController.click_notIntersted)


module.exports = router;