const { qualitiesService } = require("../../../services/description-builder/qualities/qualities.services");

let qualitiesSetsController = {};
qualitiesSetsController.findOne = async(req, res) => {
    try {
        let result = await qualitiesService.sets.findOne(req.params.id);
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

qualitiesSetsController.findAll = async(req, res) => {
    try {
        let result = await qualitiesService.sets.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

qualitiesSetsController.create = async(req, res) => {
    try {
        let result = await qualitiesService.sets.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

qualitiesSetsController.update = async(req, res) => {
    try {
        let result = await qualitiesService.sets.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

qualitiesSetsController.addItem = async(req, res) => {
    try {
        let result = await qualitiesService.sets.addItem(req.params.id, req.body);
        return res.status(200).json({ 'msg': "added successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

qualitiesSetsController.removeItem = async(req, res) => {
    try {
        let result = await qualitiesService.sets.removeItem(req.params.id, req.body);
        return res.status(200).json({ 'msg': "removed successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


qualitiesSetsController.delete = async(req, res) => {
    try {
        let result = await qualitiesService.sets.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

module.exports = qualitiesSetsController;