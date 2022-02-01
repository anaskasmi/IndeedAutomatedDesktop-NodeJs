const ApplyMethodsSet = require("../../../../models/ApplyMethod/ApplyMethodsSet")

exports.addItem = async(id, data) => {
    return ApplyMethodsSet.findByIdAndUpdate(id, {
        $addToSet: {
            applyMethod: data.applyMethod
        }
    }, {
        new: true
    })
}