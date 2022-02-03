const { applyMethodsService } = require("../../../services/description-builder/applyMethods/applyMethods.services");

let applyMethodsSetsController = {};
applyMethodsSetsController.findOne = async(req, res) => {
    try {
        let result = await applyMethodsService.sets.findOne(req.params.id);
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

applyMethodsSetsController.findAll = async(req, res) => {
    try {
        let result = await applyMethodsService.sets.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

applyMethodsSetsController.create = async(req, res) => {
    try {
        let result = await applyMethodsService.sets.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

applyMethodsSetsController.update = async(req, res) => {
    try {
        let result = await applyMethodsService.sets.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

applyMethodsSetsController.addItem = async(req, res) => {
    try {
        let result = await applyMethodsService.sets.addItem(req.params.id, req.body);
        return res.status(200).json({ 'msg': "added successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

applyMethodsSetsController.removeItem = async(req, res) => {
    try {
        let result = await applyMethodsService.sets.removeItem(req.params.id, req.body);
        return res.status(200).json({ 'msg': "removed successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}


applyMethodsSetsController.delete = async(req, res) => {
    try {
        let result = await applyMethodsService.sets.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

module.exports = applyMethodsSetsController;