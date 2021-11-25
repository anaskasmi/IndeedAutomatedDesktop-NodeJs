//dependencies
require('dotenv').config();

//services
const UpdateJobService = require('../services/UpdateJobService');
const BrowserService = require('../services/BrowserService');


let UpdateJobController = {};



UpdateJobController.getNewBrowser = async function(req, res) {
    try {

        await BrowserService.getNewBrowser(true);
        return res.status(200).json({ 'msg': "opened successfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });

    }
}

UpdateJobController.updateJob = async(req, res) => {
    req.setTimeout(0);
    try {
        let data = {
            id: req.body.id,
            jobTitle: req.body.jobTitle,
            location: req.body.location,
            description: req.body.description,
            budget: req.body.budget,
            maxCPC: req.body.maxCPC,
            budgetEndDate: req.body.budgetEndDate
        }
        await UpdateJobService.updateJob(data);

        return res.status(200).json({ "msg": "Job Updated successfully" });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }
}


module.exports = UpdateJobController;