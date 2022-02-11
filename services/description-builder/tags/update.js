const Tag = require("../../../models/Tag/Tag")

exports.update = async(id, data) => {
    return Tag.findByIdAndUpdate(id, {
        name: data.name,
        content: data.content,
    }, {
        new: true
    });
}