const IncentivesSet = require("../../../../models/Incentive/IncentivesSet")

exports.create = async(data) => {
    return IncentivesSet.create({
        name: data.name,
        incentives: data.incentives
    });
}