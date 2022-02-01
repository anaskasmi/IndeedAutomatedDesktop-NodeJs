const Quality = require("../../../../models/Quality/Quality")

exports.deleteOne = async(id) => {
    return Quality.findByIdAndDelete(id);
}