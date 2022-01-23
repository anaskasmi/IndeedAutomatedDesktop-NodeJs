const ExperiencesSet = require("../../../../models/Experience/ExperiencesSet")
exports.findAll = async() => {
    return ExperiencesSet.find();
}