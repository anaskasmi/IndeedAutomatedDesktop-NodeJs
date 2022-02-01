const Quality = require("../../../../models/Quality/Quality")

exports.create = async(data) => {
    return Quality.create({
        name: data.name
    });
}