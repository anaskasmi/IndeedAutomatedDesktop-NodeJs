const Incentive = require("../../../../models/Incentive/Incentive")

exports.create = async(data) => {
    return Incentive.create({
        name: data.name
    });
}