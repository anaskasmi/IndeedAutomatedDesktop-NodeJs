const RoleDescription = require("../../../../models/RoleDescription/RoleDescription")

exports.findOne = async(id) => {
    return RoleDescription.findById(id);
}