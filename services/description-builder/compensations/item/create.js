const Compensation = require("../../../../models/Compensation/Compensation")

exports.create = async(data) => {
    return Compensation.create({
        name: data.name
    });
}