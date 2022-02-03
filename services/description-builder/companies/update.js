const Company = require("../../../models/Company/Company")

exports.update = async(id, data) => {
    return Company.findByIdAndUpdate(id, {
        name: data.name,
        description: data.description,
        website: data.website,
        culture: data.culture,
        city: data.city,
        state: data.state,
    }, {
        new: true
    });
}