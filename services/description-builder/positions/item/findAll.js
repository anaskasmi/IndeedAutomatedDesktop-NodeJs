const Position = require("../../../../models/Position/Position")

exports.findAll = async() => {
    return Position.find();
}