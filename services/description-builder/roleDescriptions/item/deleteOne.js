const RoleDescription = require("../../../../models/RoleDescription/RoleDescription")

exports.deleteOne = async(id) => {
    return RoleDescription.findByIdAndDelete(id);
}