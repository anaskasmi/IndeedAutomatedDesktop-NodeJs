const QualitiesSet = require("../../../../models/Quality/QualitiesSet")
exports.findOne = async(id) => {
    return QualitiesSet.findById(id);
}