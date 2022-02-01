const IncentivesSet = require("../../../../models/Incentive/IncentivesSet")

exports.removeItem = async(id, data) => {
    return IncentivesSet.findByIdAndUpdate(id, {
        $pull: {
            incentives: data.incentive
        }
    }, {
        new: true
    });
}