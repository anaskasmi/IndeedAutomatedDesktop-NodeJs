const ExperiencesSet = require("../../../../models/Experience/ExperiencesSet")

exports.update = async(id, data) => {
    return ExperiencesSet.findByIdAndUpdate(id, {
        $set: {
            experiences: data.experiences,
            name: data.name,
        }
    }, {
        new: true
    });
}