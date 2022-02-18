const Posting = require("../../../models/Posting/Posting")

exports.deleteOne = async(id) => {
    return Posting.findByIdAndDelete(id);
}