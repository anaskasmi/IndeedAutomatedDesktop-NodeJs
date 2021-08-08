//dependencies
require('dotenv').config();

//services
const ResumesService = require('../services/ResumesService');
const BrowserService = require('../services/BrowserService');

let ResumesController = {};

ResumesController.getNewBrowser = async function(req, res) {
    req.setTimeout(0);
    try {
        await BrowserService.getNewBrowser(true);
        return res.status(200).json({ 'msg': "opened successfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });

    }
}
ResumesController.getJobEmail = async function(req, res) {
    req.setTimeout(0);
    try {
        let jobEmail = await ResumesService.getJobEmail(req.body.jobId);
        if (jobEmail) {
            return res.status(200).json({ 'msg': "Job Email Retrieved successfully", jobEmail });
        } else {
            return res.status(404).json({ 'msg': "Job Email Was not found" });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 'msg': error.message });
    }
}
ResumesController.getCandidatesDetails = async function(req, res) {
    req.setTimeout(0);
    try {
        let candidates = await ResumesService.getCandidatesDetails(req.body.jobId);
        if (candidates) {
            return res.status(200).json({ 'msg': "Job candidates Retrieved successfully", candidates });
        } else {
            return res.status(404).json({ 'msg': "Job candidates Was not found" });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 'msg': error.message });
    }
}
ResumesController.transferResumeOfOneCandidate = async function(req, res) {
    req.setTimeout(0);
    try {
        await ResumesService.transferResumeOfOneCandidate(req.body.jobId, req.body.candidateId);
        return res.status(200).json({ 'msg': "Resume tranfered successflully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 'msg': error.message });
    }
}
ResumesController.transferAllResumesForOneJob = async function(req, res) {
    req.setTimeout(0);
    try {
        await ResumesService.transferAllResumesForOneJob(req.body.jobId);
        return res.status(200).json({ 'msg': "All Resume Transfered successfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 'msg': error.message });
    }
}
ResumesController.getCandidatesBetweenTwoDates = async function(req, res) {
    req.setTimeout(0);
    try {
        let candidates = await ResumesService.getCandidatesBetweenTwoDates(req.body.startDate, req.body.endDate);
        return res.status(200).json({ 'candidates': candidates });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 'msg': error.message });
    }
}
ResumesController.transferResumesOfCandidatesList = async function(req, res) {
    req.setTimeout(0);
    try {
        let candidates = await ResumesService.transferResumesOfCandidatesList(req.body.candidatesList);
        return res.status(200).json({ 'candidates': candidates });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 'msg': error.message });
    }
}



module.exports = ResumesController;