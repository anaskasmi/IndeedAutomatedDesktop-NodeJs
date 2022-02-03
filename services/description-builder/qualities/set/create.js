const QualitiesSet = require("../../../../models/Quality/QualitiesSet")

exports.create = async(data) => {
    return QualitiesSet.create({
        name: data.name,
        qualities: data.qualities
    });
}