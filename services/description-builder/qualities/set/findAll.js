const QualitiesSet = require("../../../../models/Quality/QualitiesSet")
exports.findAll = async() => {
    return QualitiesSet.find().populate({ path: 'qualities' });
}