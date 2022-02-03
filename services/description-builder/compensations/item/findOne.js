const Compensation = require("../../../../models/Compensation/Compensation")

exports.findOne = async(id) => {
    return Compensation.findById(id);
}