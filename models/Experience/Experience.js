const mongoose = require('mongoose');

const ExperienceSchema = mongoose.Schema({
    name: { type: String },
});

module.exports = mongoose.model('Experience', ExperienceSchema);