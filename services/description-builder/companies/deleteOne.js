const Company = require("../../../models/Company/Company")

exports.deleteOne = async(id) => {
    return Company.findByIdAndDelete(id);
}