const Tag = require("../../../models/Tag/Tag")

exports.findAll = async() => {
    return Tag.find();
}