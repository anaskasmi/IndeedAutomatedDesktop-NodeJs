const Experience = require("../../../../models/Experience/Experience")

exports.findOne = async(id) => {
    return Experience.findById(id);
}