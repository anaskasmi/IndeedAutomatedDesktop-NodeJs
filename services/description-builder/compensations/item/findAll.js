const Compensation = require("../../../../models/Compensation/Compensation")

exports.findAll = async() => {
    return Compensation.find();
}