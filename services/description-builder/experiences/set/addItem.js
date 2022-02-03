const ExperiencesSet = require("../../../../models/Experience/ExperiencesSet")

exports.addItem = async(id, data) => {
    return ExperiencesSet.findByIdAndUpdate(id, {
        $addToSet: {
            experiences: data.experience
        }
    }, {
        new: true
    })
}