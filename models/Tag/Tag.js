const mongoose = require('mongoose');

const TagSchema = mongoose.Schema({
    name: { type: String },
});

module.exports = mongoose.model('Tag', TagSchema);