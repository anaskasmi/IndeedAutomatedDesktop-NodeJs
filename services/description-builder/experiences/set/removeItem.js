const ExperiencesSet = require("../../../../models/Experience/ExperiencesSet")

exports.removeItem = async(id, data) => {
    return ExperiencesSet.findByIdAndUpdate(id, {
        $pull: {
            experiences: data.experience
        }
    }, {
        new: true
    });
}