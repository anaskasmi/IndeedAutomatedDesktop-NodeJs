const Incentive = require("../../../../models/Incentive/Incentive")

exports.update = async(id, data) => {
    return Incentive.findByIdAndUpdate(id, {
        name: data.name
    }, {
        new: true
    });
}