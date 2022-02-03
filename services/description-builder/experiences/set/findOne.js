const ExperiencesSet = require("../../../../models/Experience/ExperiencesSet")
exports.findOne = async(id) => {
    return ExperiencesSet.findById(id);
}