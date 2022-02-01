const PositionsSet = require("../../../../models/Position/PositionsSet")

exports.create = async(data) => {
    return PositionsSet.create({
        name: data.name,
        positions: data.positions
    });
}