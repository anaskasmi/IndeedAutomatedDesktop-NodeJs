const IncentivesSet = require("../../../../models/Incentive/IncentivesSet")

exports.addItem = async(id, data) => {
    return IncentivesSet.findByIdAndUpdate(id, {
        $addToSet: {
            incentives: data.incentive
        }
    }, {
        new: true
    })
}