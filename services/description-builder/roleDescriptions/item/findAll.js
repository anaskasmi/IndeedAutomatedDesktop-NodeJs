const RoleDescription = require("../../../../models/RoleDescription/RoleDescription")

exports.findAll = async() => {
    return RoleDescription.find();
}