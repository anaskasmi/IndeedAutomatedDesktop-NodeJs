const CompensationsSet = require("../../../../models/Compensation/CompensationsSet")

exports.update = async(id, data) => {
    return CompensationsSet.findByIdAndUpdate(id, {
        $set: {
            compensations: data.compensations,
            name: data.name,
        }
    }, {
        new: true
    });
}