const Quality = require("../../../../models/Quality/Quality")

exports.findAll = async() => {
    return Quality.find();
}