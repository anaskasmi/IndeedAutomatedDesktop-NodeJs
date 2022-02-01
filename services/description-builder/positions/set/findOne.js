const PositionsSet = require("../../../../models/Position/PositionsSet")
exports.findOne = async(id) => {
    return PositionsSet.findById(id);
}