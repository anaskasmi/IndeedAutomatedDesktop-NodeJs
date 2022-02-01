const CompensationsSet = require("../../../../models/Compensation/CompensationsSet")

exports.create = async(data) => {
    return CompensationsSet.create({
        name: data.name,
        compensations: data.compensations
    });
}