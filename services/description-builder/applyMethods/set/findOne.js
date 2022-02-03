const ApplyMethodsSet = require("../../../../models/ApplyMethod/ApplyMethodsSet")
exports.findOne = async(id) => {
    return ApplyMethodsSet.findById(id);
}