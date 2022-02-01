const ApplyMethodsSet = require("../../../../models/ApplyMethod/ApplyMethodsSet")
exports.findAll = async() => {
    return ApplyMethodsSet.find().populate({ path: 'applyMethods' });
}