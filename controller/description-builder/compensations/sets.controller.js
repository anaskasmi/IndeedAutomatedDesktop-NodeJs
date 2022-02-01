const { compensationsService } = require("../../../services/description-builder/compensations/compensations.services");

let compensationsSetsController = {};
compensationsSetsController.findOne = async(req, res) => {
    try {
        let result = await compensationsService.sets.findOne(req.params.id);
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

compensationsSetsController.findAll = async(req, res) => {
    try {
        let result = await compensationsService.sets.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

compensationsSetsController.create = async(req, res) => {
    try {
        let result = await compensationsService.sets.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

compensationsSetsController.update = async(req, res) => {
    try {
        let result = await compensationsService.sets.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

compensationsSetsController.addItem = async(req, res) => {
    try {
        let result = await compensationsService.sets.addItem(req.params.id, req.body);
        return res.status(200).json({ 'msg': "added successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

compensationsSetsController.removeItem = async(req, res) => {
    try {
        let result = await compensationsService.sets.removeItem(req.params.id, req.body);
        return res.status(200).json({ 'msg': "removed successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


compensationsSetsController.delete = async(req, res) => {
    try {
        let result = await compensationsService.sets.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

module.exports = compensationsSetsController;