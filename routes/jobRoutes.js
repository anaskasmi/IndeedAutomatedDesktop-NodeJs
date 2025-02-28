//packages
const express = require('express');
//controllers
const JobsController = require('../controller/JobsController');
const ResumesController = require('../controller/ResumesController');
const UpdateJobController = require('../controller/UpdateJobController');
const IndeedInvoiceController = require('../controller/IndeedInvoiceController');
//config
const router = express.Router();

//login routes
router.get('/getNewBrowserForRepost', JobsController.getNewBrowser)
router.get('/getNewBrowserForUpdate', UpdateJobController.getNewBrowser)

//scrap data routes
router.get('/scrapAllJobs', JobsController.scrapAllJobs)
router.get('/getAllJobsFromDb', JobsController.getAllJobsFromDb)

//update job routes 
router.post('/updateJob', UpdateJobController.updateJob)

//get data routes 
router.get('/getJobDataFromDb/:id', JobsController.getJobDataFromDb)

//reposting routes
router.get('/saveCookies', JobsController.saveCookies)
router.get('/openPostJobPage', JobsController.openPostJobPage)
router.post('/fillIn_JobTitle', JobsController.fillIn_JobTitle)
router.get('/fillIn_JobCategory', JobsController.fillIn_JobCategory)
router.post('/fillIn_location', JobsController.fillIn_location)
router.post('/fillIn_IsJobremote', JobsController.fillIn_IsJobremote)
router.get('/clickSaveAndContinue', JobsController.clickSaveAndContinue)
router.post('/fillIn_isJobFullTimeOrPartTime', JobsController.fillIn_isJobFullTimeOrPartTime)
router.get('/fillIn_schedule', JobsController.fillIn_schedule)
router.post('/fillIn_hiresNumber', JobsController.fillIn_hiresNumber)
router.post('/fillIn_deadline', JobsController.fillIn_deadline)
router.post('/fillIn_salary', JobsController.fillIn_salary)
router.post('/fillIn_description', JobsController.fillIn_description)
router.get('/fillIn_isResumeRequired', JobsController.fillIn_isResumeRequired)
router.get('/click_confirm', JobsController.click_confirm)
router.get('/click_advanced', JobsController.click_advanced)
router.get('/fillIn_adDurationType', JobsController.fillIn_adDurationType)
router.post('/fillIn_adDurationDate', JobsController.fillIn_adDurationDate)
router.post('/fillIn_CPC', JobsController.fillIn_CPC)
router.post('/fillIn_adBudget', JobsController.fillIn_adBudget)
router.post('/closeJob', JobsController.closeJob)
router.post('/fillIn_email', JobsController.fillIn_email)
router.post('/fillIn_benefits', JobsController.fillIn_benefits)
router.get('/close_questions', JobsController.close_questions)
router.get('/click_skip', JobsController.click_skip)
router.get('/fillIn_isJobRemote', JobsController.fillIn_isJobRemote)
router.get('/fillIn_otherBenefits', JobsController.fillIn_otherBenefits)
router.get('/fillIn_webSite', JobsController.fillIn_webSite)
router.get('/fillIn_industry', JobsController.fillIn_industry)
router.post('/review_potential_matches', JobsController.review_potential_matches)
router.post('/skip_qualifications', JobsController.skip_qualifications)
router.get('/skip_preview_page', JobsController.skip_preview_page)
router.get('/duplicate_job/:id', JobsController.duplicateJob)


//resume job routes 
router.post('/getCandidatesBetweenTwoDates', ResumesController.getCandidatesBetweenTwoDates)
router.post('/transferResumesOfCandidatesList', ResumesController.transferResumesOfCandidatesList)


//generate Invoice route
router.post('/invoiceGenerator', IndeedInvoiceController.generateInvoice)


module.exports = router;