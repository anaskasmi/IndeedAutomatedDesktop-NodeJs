const Incentive = require("../../../../models/Incentive/Incentive")

exports.deleteOne = async(id) => {
    return Incentive.findByIdAndDelete(id);
}