const Company = require("../../../models/Company/Company")

exports.findAll = async() => {
    return Company.find();
}