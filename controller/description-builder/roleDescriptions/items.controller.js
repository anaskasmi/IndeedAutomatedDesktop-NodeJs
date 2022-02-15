const { roleDescriptionsService } = require("../../../services/description-builder/roleDescriptions/roleDescriptions.services");
let roleDescriptionsItemsController = {};
roleDescriptionsItemsController.findOne = async function(req, res) {
    try {
        let result = await roleDescriptionsService.items.findOne(req.params.id);
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

roleDescriptionsItemsController.findAll = async(req, res) => {
    try {
        let result = await roleDescriptionsService.items.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

roleDescriptionsItemsController.create = async(req, res) => {
    try {
        let result = await roleDescriptionsService.items.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

roleDescriptionsItemsController.update = async(req, res) => {
    try {
        let result = await roleDescriptionsService.items.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}



roleDescriptionsItemsController.delete = async(req, res) => {
    try {
        let result = await roleDescriptionsService.items.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


module.exports = roleDescriptionsItemsController;