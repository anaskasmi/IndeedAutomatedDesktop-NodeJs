const Tag = require("../../../models/Tag/Tag")

exports.deleteOne = async(id) => {
    return Tag.findByIdAndDelete(id);
}