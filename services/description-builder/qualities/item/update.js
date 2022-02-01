const Quality = require("../../../../models/Quality/Quality")

exports.update = async(id, data) => {
    return Quality.findByIdAndUpdate(id, {
        name: data.name
    }, {
        new: true
    });
}