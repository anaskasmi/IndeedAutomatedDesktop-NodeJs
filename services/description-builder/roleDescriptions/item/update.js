const RoleDescription = require("../../../../models/RoleDescription/RoleDescription")

exports.update = async(id, data) => {
    return RoleDescription.findByIdAndUpdate(id, {
        name: data.name
    }, {
        new: true
    });
}