const IncentivesSet = require("../../../../models/Incentive/IncentivesSet")

exports.update = async(id, data) => {
    return IncentivesSet.findByIdAndUpdate(id, {
        $set: {
            incentives: data.incentives,
            name: data.name,
        }
    }, {
        new: true
    });
}