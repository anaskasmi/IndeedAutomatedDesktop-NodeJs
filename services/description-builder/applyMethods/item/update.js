const ApplyMethod = require("../../../../models/ApplyMethod/ApplyMethod")

exports.update = async(id, data) => {
    return ApplyMethod.findByIdAndUpdate(id, {
        name: data.name
    }, {
        new: true
    });
}