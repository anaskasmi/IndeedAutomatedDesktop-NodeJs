const Position = require("../../../../models/Position/Position")

exports.create = async(data) => {
    return Position.create({
        name: data.name
    });
}