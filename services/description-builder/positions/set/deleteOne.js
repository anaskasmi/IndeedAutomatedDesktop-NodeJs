const PositionsSet = require("../../../../models/Position/PositionsSet")

exports.deleteOne = async(id) => {
    return PositionsSet.findByIdAndDelete(id);
}