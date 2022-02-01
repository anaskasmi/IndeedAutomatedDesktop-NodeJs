const QualitiesSet = require("../../../../models/Quality/QualitiesSet")

exports.addItem = async(id, data) => {
    return QualitiesSet.findByIdAndUpdate(id, {
        $addToSet: {
            qualities: data.quality
        }
    }, {
        new: true
    })
}