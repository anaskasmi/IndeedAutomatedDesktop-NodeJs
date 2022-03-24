const { compensationsService } = require("../../../services/description-builder/compensations/compensations.services");
let compensationsItemsController = {};

compensationsItemsController.populate = async(req, res) => {
    try {
        await compensationsService.items.populate();
        return res.status(200).json({ 'msg': "populated successfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

compensationsItemsController.findOne = async function(req, res) {
    try {
        let result = await compensationsService.items.findOne(req.params.id);
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

compensationsItemsController.findAll = async(req, res) => {
    try {
        let result = await compensationsService.items.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}



compensationsItemsController.create = async(req, res) => {
    try {
        let result = await compensationsService.items.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

compensationsItemsController.update = async(req, res) => {
    try {
        let result = await compensationsService.items.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}



compensationsItemsController.delete = async(req, res) => {
    try {
        let result = await compensationsService.items.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


module.exports = compensationsItemsController;