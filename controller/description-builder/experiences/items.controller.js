const { experiencesService } = require("../../../services/description-builder/experiences/experiences.services");
let experiencesItemsController = {};
experiencesItemsController.findOne = async function(req, res) {
    try {
        let result = await experiencesService.items.findOne(req.params.id);
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

experiencesItemsController.findAll = async(req, res) => {
    try {
        let result = await experiencesService.items.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

experiencesItemsController.create = async(req, res) => {
    try {
        let result = await experiencesService.items.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

experiencesItemsController.update = async(req, res) => {
    try {
        let result = await experiencesService.items.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}



experiencesItemsController.delete = async(req, res) => {
    try {
        let result = await experiencesService.items.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


module.exports = experiencesItemsController;