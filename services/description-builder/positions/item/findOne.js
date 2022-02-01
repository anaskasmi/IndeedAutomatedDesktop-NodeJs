const Position = require("../../../../models/Position/Position")

exports.findOne = async(id) => {
    return Position.findById(id);
}