const ApplyMethodsSet = require("../../../../models/ApplyMethod/ApplyMethodsSet")

exports.removeItem = async(id, data) => {
    return ApplyMethodsSet.findByIdAndUpdate(id, {
        $pull: {
            applyMethods: data.applyMethod
        }
    }, {
        new: true
    });
}