const ApplyMethodsSet = require("../../../../models/ApplyMethod/ApplyMethodsSet")

exports.update = async(id, data) => {
    return ApplyMethodsSet.findByIdAndUpdate(id, {
        $set: {
            applyMethods: data.applyMethods,
            name: data.name,
        }
    }, {
        new: true
    });
}