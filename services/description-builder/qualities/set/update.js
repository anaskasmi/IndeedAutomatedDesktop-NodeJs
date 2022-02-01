const QualitiesSet = require("../../../../models/Quality/QualitiesSet")

exports.update = async(id, data) => {
    return QualitiesSet.findByIdAndUpdate(id, {
        $set: {
            qualities: data.qualities,
            name: data.name,
        }
    }, {
        new: true
    });
}