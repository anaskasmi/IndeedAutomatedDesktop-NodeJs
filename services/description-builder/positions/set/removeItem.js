const PositionsSet = require("../../../../models/Position/PositionsSet")

exports.removeItem = async(id, data) => {
    return PositionsSet.findByIdAndUpdate(id, {
        $pull: {
            positions: data.position
        }
    }, {
        new: true
    });
}