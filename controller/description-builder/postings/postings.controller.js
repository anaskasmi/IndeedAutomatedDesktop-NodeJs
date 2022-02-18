const { postingsService } = require("../../../services/description-builder/postings/postings.services");
let postingsController = {};

postingsController.findAll = async(req, res) => {
    try {
        let result = await postingsService.findAll();
        return res.status(200).json({ 'msg': "found successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

postingsController.create = async(req, res) => {
    try {
        let result = await postingsService.create(req.body);
        return res.status(200).json({ 'msg': "created successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

postingsController.update = async(req, res) => {
    try {
        let result = await postingsService.update(req.params.id, req.body);
        return res.status(200).json({ 'msg': "updated successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

postingsController.delete = async(req, res) => {
    try {
        let result = await postingsService.deleteOne(req.params.id);
        return res.status(200).json({ 'msg': "deleted successfully", data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

module.exports = postingsController;