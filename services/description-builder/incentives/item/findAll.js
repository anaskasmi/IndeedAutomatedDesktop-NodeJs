const Incentive = require("../../../../models/Incentive/Incentive")

exports.findAll = async() => {
    return Incentive.find();
}