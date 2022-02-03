const ApplyMethodsSet = require("../../../../models/ApplyMethod/ApplyMethodsSet")

exports.create = async(data) => {
    return ApplyMethodsSet.create({
        name: data.name,
        applyMethods: data.applyMethods
    });
}