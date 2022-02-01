const { incentivesService } = require("../../../services/description-builder/incentives/incentives.services");

let incentivesSetsController = {};
incentivesSetsController.findOne = async(req, res) => {
    try {
        let result = await incentivesService.sets.findOne(req.params.id);
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

incentivesSetsController.findAll = async(req, res) => {
    try {
        let result = await incentivesService.sets.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

incentivesSetsController.create = async(req, res) => {
    try {
        let result = await incentivesService.sets.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

incentivesSetsController.update = async(req, res) => {
    try {
        let result = await incentivesService.sets.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

incentivesSetsController.addItem = async(req, res) => {
    try {
        let result = await incentivesService.sets.addItem(req.params.id, req.body);
        return res.status(200).json({ 'msg': "added successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

incentivesSetsController.removeItem = async(req, res) => {
    try {
        let result = await incentivesService.sets.removeItem(req.params.id, req.body);
        return res.status(200).json({ 'msg': "removed successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


incentivesSetsController.delete = async(req, res) => {
    try {
        let result = await incentivesService.sets.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

module.exports = incentivesSetsController;