const ApplyMethod = require("../../../../models/ApplyMethod/ApplyMethod")

exports.deleteOne = async(id) => {
    return ApplyMethod.findByIdAndDelete(id);
}