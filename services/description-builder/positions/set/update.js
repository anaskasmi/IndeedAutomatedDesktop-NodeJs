const PositionsSet = require("../../../../models/Position/PositionsSet")

exports.update = async(id, data) => {
    return PositionsSet.findByIdAndUpdate(id, {
        $set: {
            positions: data.positions,
            name: data.name,
        }
    }, {
        new: true
    });
}