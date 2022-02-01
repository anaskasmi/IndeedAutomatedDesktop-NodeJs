const { positionsService } = require("../../../services/description-builder/positions/positions.services");

let positionsSetsController = {};
positionsSetsController.findOne = async(req, res) => {
    try {
        let result = await positionsService.sets.findOne(req.params.id);
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

positionsSetsController.findAll = async(req, res) => {
    try {
        let result = await positionsService.sets.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

positionsSetsController.create = async(req, res) => {
    try {
        let result = await positionsService.sets.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

positionsSetsController.update = async(req, res) => {
    try {
        let result = await positionsService.sets.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

positionsSetsController.addItem = async(req, res) => {
    try {
        let result = await positionsService.sets.addItem(req.params.id, req.body);
        return res.status(200).json({ 'msg': "added successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

positionsSetsController.removeItem = async(req, res) => {
    try {
        let result = await positionsService.sets.removeItem(req.params.id, req.body);
        return res.status(200).json({ 'msg': "removed successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


positionsSetsController.delete = async(req, res) => {
    try {
        let result = await positionsService.sets.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

module.exports = positionsSetsController;