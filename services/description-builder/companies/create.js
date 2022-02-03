const Company = require("../../../models/Company/Company")

exports.create = async(data) => {
    return Company.create({
        name: data.name,
        description: data.description,
        website: data.website,
        culture: data.culture,
        city: data.city,
        state: data.state,
    });
}