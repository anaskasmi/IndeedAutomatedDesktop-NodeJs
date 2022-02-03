const ApplyMethod = require("../../../../models/ApplyMethod/ApplyMethod")

exports.findOne = async(id) => {
    return ApplyMethod.findById(id);
}