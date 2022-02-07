const Tag = require("../../../models/Tag/Tag")

exports.create = async(data) => {
    return Tag.create({
        name: data.name
    });
}