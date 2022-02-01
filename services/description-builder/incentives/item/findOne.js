const Incentive = require("../../../../models/Incentive/Incentive")

exports.findOne = async(id) => {
    return Incentive.findById(id);
}