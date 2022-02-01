const ApplyMethodsSet = require("../../../../models/ApplyMethod/ApplyMethodsSet")

exports.deleteOne = async(id) => {
    return ApplyMethodsSet.findByIdAndDelete(id);
}