//dependencies
require('dotenv').config();

//services
const ResumesService = require('../services/ResumesService');

let ResumesController = {};

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