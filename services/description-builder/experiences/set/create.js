const ExperiencesSet = require("../../../../models/Experience/ExperiencesSet")

exports.create = async(data) => {
    return ExperiencesSet.create({
        name: data.name,
        experiences: []
    });
}