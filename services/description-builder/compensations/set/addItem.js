const CompensationsSet = require("../../../../models/Compensation/CompensationsSet")

exports.addItem = async(id, data) => {
    return CompensationsSet.findByIdAndUpdate(id, {
        $addToSet: {
            compensations: data.compensation
        }
    }, {
        new: true
    })
}