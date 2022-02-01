const CompensationsSet = require("../../../../models/Compensation/CompensationsSet")

exports.removeItem = async(id, data) => {
    return CompensationsSet.findByIdAndUpdate(id, {
        $pull: {
            compensations: data.compensation
        }
    }, {
        new: true
    });
}