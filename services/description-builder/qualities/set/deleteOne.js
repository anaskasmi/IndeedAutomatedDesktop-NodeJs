const QualitiesSet = require("../../../../models/Quality/QualitiesSet")

exports.deleteOne = async(id) => {
    return QualitiesSet.findByIdAndDelete(id);
}