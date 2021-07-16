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
ResumesController.downloadResumesForOneJob = async function(req, res) {
    req.setTimeout(0);
    try {
        await ResumesService.downloadResumesForOneJob(req.body.jobId);
        return res.status(200).json({ 'msg': "Downloaded successfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}



module.exports = ResumesController;