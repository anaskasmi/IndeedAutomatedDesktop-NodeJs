const { experiencesService } = require("../../../services/description-builder/experiences/experiences.services");

let experiencesSetsController = {};
experiencesSetsController.findOne = async(req, res) => {
    try {
        let result = await experiencesService.sets.findOne(req.params.id);
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

experiencesSetsController.findAll = async(req, res) => {
    try {
        let result = await experiencesService.sets.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

experiencesSetsController.create = async(req, res) => {
    try {
        let result = await experiencesService.sets.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

experiencesSetsController.update = async(req, res) => {
    try {
        let result = await experiencesService.sets.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

experiencesSetsController.addItem = async(req, res) => {
    try {
        let result = await experiencesService.sets.addItem(req.params.id, req.body);
        return res.status(200).json({ 'msg': "added successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

experiencesSetsController.removeItem = async(req, res) => {
    try {
        let result = await experiencesService.sets.removeItem(req.params.id, req.body);
        return res.status(200).json({ 'msg': "removed successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


experiencesSetsController.delete = async(req, res) => {
    try {
        let result = await experiencesService.sets.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

module.exports = experiencesSetsController;