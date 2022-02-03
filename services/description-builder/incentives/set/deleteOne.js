const IncentivesSet = require("../../../../models/Incentive/IncentivesSet")

exports.deleteOne = async(id) => {
    return IncentivesSet.findByIdAndDelete(id);
}