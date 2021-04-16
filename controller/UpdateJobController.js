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

        console.log(req.body.id);

        await UpdateJobService.openUpdatePage(req.body.id, req.body.jobTitle, req.body.location);

        //update getting started 
        if (req.body.id || req.body.jobTitle || req.body.location) {
            await UpdateJobService.updateGettingStartedSection(req.body.id, req.body.jobTitle, req.body.location);
        }

        //update description
        if (req.body.description) {
            await UpdateJobService.updateDescriptionSection(req.body.id, req.body.description);
        }

        //update job service
        if (req.body.budget || req.body.maxCPC || req.body.budgetEndDate) {
            await UpdateJobService.updateSponsorJobSection(req.body.id, req.body.budget, req.body.maxCPC, req.body.budgetEndDate);
        }

        return res.status(200).json({ "msg": "Job Updated successfully" });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }
}


module.exports = UpdateJobController;