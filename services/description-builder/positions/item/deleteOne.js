const Position = require("../../../../models/Position/Position")

exports.deleteOne = async(id) => {
    return Position.findByIdAndDelete(id);
}