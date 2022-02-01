const PositionsSet = require("../../../../models/Position/PositionsSet")

exports.addItem = async(id, data) => {
    return PositionsSet.findByIdAndUpdate(id, {
        $addToSet: {
            positions: data.position
        }
    }, {
        new: true
    })
}