const mongoose = require('mongoose');

const QualitiesSetSchema = mongoose.Schema({
    name: { type: String },
    qualities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quality' }]

});

module.exports = mongoose.model('QualitiesSet', QualitiesSetSchema);