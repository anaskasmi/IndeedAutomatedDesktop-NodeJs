const ApplyMethod = require("../../../../models/ApplyMethod/ApplyMethod")

exports.findAll = async() => {
    return ApplyMethod.find();
}