//packages
const express = require('express');
//controllers
const JobsController = require('../controller/JobsController');
const UpdateJobController = require('../controller/UpdateJobController');
//config
const router = express.Router();



//login routes
router.get('/getNewBrowserForRepost', JobsController.getNewBrowser)
router.get('/getNewBrowserForUpdate', UpdateJobController.getNewBrowser)

//scrap data routes
router.get('/scrapAllJobs', JobsController.scrapAllJobs)
router.get('/getAllJobsFromDb', JobsController.getAllJobsFromDb)
router.post('/getJobFullDetails', JobsController.getJobFullDetails)

//update job
router.post('/updateJob', UpdateJobController.updateJob)

//reposting routes
router.get('/openPostJobPage', JobsController.openPostJobPage)
router.get('/unlockCompanyNameInput', JobsController.unlockCompanyNameInput)
router.post('/fillIn_CompanyName', JobsController.fillIn_CompanyName)
router.post('/fillIn_JobTitle', JobsController.fillIn_JobTitle)
router.get('/fillIn_JobCategory', JobsController.fillIn_JobCategory)
router.post('/fillIn_RolesLocation', JobsController.fillIn_RolesLocation)
router.post('/fillIn_IsJobremote', JobsController.fillIn_IsJobremote)
router.get('/clickSaveAndContinue', JobsController.clickSaveAndContinue)
router.post('/fillIn_isJobFullTimeOrPartTime', JobsController.fillIn_isJobFullTimeOrPartTime)
router.get('/fillIn_schedule', JobsController.fillIn_schedule)
router.post('/fillIn_hiresNumber', JobsController.fillIn_hiresNumber)
router.post('/fillIn_deadline', JobsController.fillIn_deadline)
router.post('/fillIn_paymentType', JobsController.fillIn_paymentType)
router.post('/fillIn_paymentFrom', JobsController.fillIn_paymentFrom)
router.post('/fillIn_paymentTo', JobsController.fillIn_paymentTo)
router.post('/fillIn_paymentPer', JobsController.fillIn_paymentPer)
router.post('/fillIn_description', JobsController.fillIn_description)
router.get('/fillIn_isResumeRequired', JobsController.fillIn_isResumeRequired)
router.get('/click_confirm', JobsController.click_confirm)
router.get('/fillIn_adDurationType', JobsController.fillIn_adDurationType)
router.get('/fillIn_adDurationDate', JobsController.fillIn_adDurationDate)
router.post('/fillIn_adBudget', JobsController.fillIn_adBudget)
router.post('/closeJob', JobsController.closeJob)
router.post('/fillIn_email', JobsController.fillIn_email)
router.get('/close_questions', JobsController.close_questions)
router.get('/fillIn_isJobRemote', JobsController.fillIn_isJobRemote)
router.get('/fillIn_otherBenefits', JobsController.fillIn_otherBenefits)
router.get('/fillIn_webSite', JobsController.fillIn_webSite)
router.post('/fillIn_salaryFromAndTo', JobsController.fillIn_salaryFromAndTo)
router.get('/fillIn_industry', JobsController.fillIn_industry)

module.exports = router;