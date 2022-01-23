const Experience = require("../../../../models/Experience/Experience")

exports.update = async(id, data) => {
    return Experience.findByIdAndUpdate(id, {
        name: data.name
    }, {
        new: true
    });
}