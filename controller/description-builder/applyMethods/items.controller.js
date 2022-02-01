const { applyMethodsService } = require("../../../services/description-builder/applyMethods/applyMethods.services");
let applyMethodsItemsController = {};
applyMethodsItemsController.findOne = async function(req, res) {
    try {
        let result = await applyMethodsService.items.findOne(req.params.id);
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

applyMethodsItemsController.findAll = async(req, res) => {
    try {
        let result = await applyMethodsService.items.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

applyMethodsItemsController.create = async(req, res) => {
    try {
        let result = await applyMethodsService.items.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

applyMethodsItemsController.update = async(req, res) => {
    try {
        let result = await applyMethodsService.items.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}



applyMethodsItemsController.delete = async(req, res) => {
    try {
        let result = await applyMethodsService.items.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


module.exports = applyMethodsItemsController;