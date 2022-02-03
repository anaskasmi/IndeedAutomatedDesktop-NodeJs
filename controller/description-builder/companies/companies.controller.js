const { companiesService } = require("../../../services/description-builder/companies/companies.services");
let companiesController = {};

companiesController.findAll = async(req, res) => {
    try {
        let result = await companiesService.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

companiesController.create = async(req, res) => {
    try {
        let result = await companiesService.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

companiesController.update = async(req, res) => {
    try {
        let result = await companiesService.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

companiesController.delete = async(req, res) => {
    try {
        let result = await companiesService.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

module.exports = companiesController;