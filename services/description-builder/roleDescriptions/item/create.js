const RoleDescription = require("../../../../models/RoleDescription/RoleDescription")

exports.create = async(data) => {
    return RoleDescription.create({
        name: data.name
    });
}