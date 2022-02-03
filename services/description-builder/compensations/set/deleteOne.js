const CompensationsSet = require("../../../../models/Compensation/CompensationsSet")

exports.deleteOne = async(id) => {
    return CompensationsSet.findByIdAndDelete(id);
}