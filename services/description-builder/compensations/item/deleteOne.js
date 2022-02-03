const Compensation = require("../../../../models/Compensation/Compensation")

exports.deleteOne = async(id) => {
    return Compensation.findByIdAndDelete(id);
}