const Experience = require("../../../../models/Experience/Experience")

exports.deleteOne = async(id) => {
    return Experience.findByIdAndDelete(id);
}