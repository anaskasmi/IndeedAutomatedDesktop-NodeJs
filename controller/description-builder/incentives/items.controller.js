const { incentivesService } = require("../../../services/description-builder/incentives/incentives.services");
let incentivesItemsController = {};
incentivesItemsController.findOne = async function(req, res) {
    try {
        let result = await incentivesService.items.findOne(req.params.id);
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

incentivesItemsController.findAll = async(req, res) => {
    try {
        let result = await incentivesService.items.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

incentivesItemsController.create = async(req, res) => {
    try {
        let result = await incentivesService.items.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

incentivesItemsController.update = async(req, res) => {
    try {
        let result = await incentivesService.items.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}



incentivesItemsController.delete = async(req, res) => {
    try {
        let result = await incentivesService.items.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


module.exports = incentivesItemsController;