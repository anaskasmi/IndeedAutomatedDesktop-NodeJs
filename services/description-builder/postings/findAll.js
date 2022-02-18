const Posting = require("../../../models/Posting/Posting")

exports.findAll = async() => {
    return Posting.find();
}