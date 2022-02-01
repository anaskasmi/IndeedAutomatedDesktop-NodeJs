const Quality = require("../../../../models/Quality/Quality")

exports.findOne = async(id) => {
    return Quality.findById(id);
}