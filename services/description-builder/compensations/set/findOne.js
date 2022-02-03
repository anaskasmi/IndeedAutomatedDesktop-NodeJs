const CompensationsSet = require("../../../../models/Compensation/CompensationsSet")
exports.findOne = async(id) => {
    return CompensationsSet.findById(id);
}