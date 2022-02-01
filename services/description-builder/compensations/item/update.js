const Compensation = require("../../../../models/Compensation/Compensation")

exports.update = async(id, data) => {
    return Compensation.findByIdAndUpdate(id, {
        name: data.name
    }, {
        new: true
    });
}