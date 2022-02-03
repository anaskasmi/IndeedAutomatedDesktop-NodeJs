const Experience = require("../../../../models/Experience/Experience")

exports.findAll = async() => {
    return Experience.find();
}