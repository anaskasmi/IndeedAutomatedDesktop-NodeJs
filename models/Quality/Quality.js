const mongoose = require('mongoose');

const QualitySchema = mongoose.Schema({
    name: { type: String },
});

module.exports = mongoose.model('Quality', QualitySchema);