const IncentivesSet = require("../../../../models/Incentive/IncentivesSet")
exports.findAll = async() => {
    return IncentivesSet.find().populate({ path: 'incentives' });
}