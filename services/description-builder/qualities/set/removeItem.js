const QualitiesSet = require("../../../../models/Quality/QualitiesSet")

exports.removeItem = async(id, data) => {
    return QualitiesSet.findByIdAndUpdate(id, {
        $pull: {
            qualities: data.quality
        }
    }, {
        new: true
    });
}