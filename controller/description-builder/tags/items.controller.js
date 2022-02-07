const { tagsService } = require("../../../services/description-builder/tags/tags.services");
let tagsItemsController = {};

tagsItemsController.findAll = async(req, res) => {
    try {
        let result = await tagsService.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

tagsItemsController.create = async(req, res) => {
    try {
        let result = await tagsService.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

tagsItemsController.update = async(req, res) => {
    try {
        let result = await tagsService.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}



tagsItemsController.delete = async(req, res) => {
    try {
        let result = await tagsService.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


module.exports = tagsItemsController;