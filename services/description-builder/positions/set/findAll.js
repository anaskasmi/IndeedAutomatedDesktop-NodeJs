const PositionsSet = require("../../../../models/Position/PositionsSet")
exports.findAll = async() => {
    return PositionsSet.find().populate({ path: 'positions' });
}