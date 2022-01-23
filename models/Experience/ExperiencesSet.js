const mongoose = require('mongoose');

const ExperiencesSetSchema = mongoose.Schema({
    name: { type: String },
    experiences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Experience' }]
});

module.exports = mongoose.model('ExperiencesSet', ExperiencesSetSchema);