const { qualitiesService } = require("../../../services/description-builder/qualities/qualities.services");
let qualitiesItemsController = {};
qualitiesItemsController.findOne = async function(req, res) {
    try {
        let result = await qualitiesService.items.findOne(req.params.id);
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

qualitiesItemsController.findAll = async(req, res) => {
    try {
        let result = await qualitiesService.items.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

qualitiesItemsController.create = async(req, res) => {
    try {
        let result = await qualitiesService.items.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

qualitiesItemsController.update = async(req, res) => {
    try {
        let result = await qualitiesService.items.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}



qualitiesItemsController.delete = async(req, res) => {
    try {
        let result = await qualitiesService.items.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


module.exports = qualitiesItemsController;