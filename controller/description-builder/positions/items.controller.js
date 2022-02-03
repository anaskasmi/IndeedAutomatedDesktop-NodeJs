const { positionsService } = require("../../../services/description-builder/positions/positions.services");
let positionsItemsController = {};
positionsItemsController.findOne = async function(req, res) {
    try {
        let result = await positionsService.items.findOne(req.params.id);
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

positionsItemsController.findAll = async(req, res) => {
    try {
        let result = await positionsService.items.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

positionsItemsController.create = async(req, res) => {
    try {
        let result = await positionsService.items.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

positionsItemsController.update = async(req, res) => {
    try {
        let result = await positionsService.items.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}



positionsItemsController.delete = async(req, res) => {
    try {
        let result = await positionsService.items.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


module.exports = positionsItemsController;