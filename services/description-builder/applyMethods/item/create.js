const ApplyMethod = require("../../../../models/ApplyMethod/ApplyMethod")

exports.create = async(data) => {
    return ApplyMethod.create({
        name: data.name
    });
}