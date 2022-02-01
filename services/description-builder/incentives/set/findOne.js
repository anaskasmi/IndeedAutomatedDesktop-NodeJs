const IncentivesSet = require("../../../../models/Incentive/IncentivesSet")
exports.findOne = async(id) => {
    return IncentivesSet.findById(id);
}