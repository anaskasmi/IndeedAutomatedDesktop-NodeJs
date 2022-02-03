const ExperiencesSet = require("../../../../models/Experience/ExperiencesSet")

exports.deleteOne = async(id) => {
    return ExperiencesSet.findByIdAndDelete(id);
}