const Position = require("../../../../models/Position/Position")

exports.update = async(id, data) => {
    return Position.findByIdAndUpdate(id, {
        name: data.name
    }, {
        new: true
    });
}