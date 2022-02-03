const Experience = require("../../../../models/Experience/Experience")

exports.create = async(data) => {
    return Experience.create({
        name: data.name
    });
}