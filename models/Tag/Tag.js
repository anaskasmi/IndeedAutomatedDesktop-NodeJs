const mongoose = require('mongoose');

const TagSchema = mongoose.Schema({
    name: { type: String },
    content: { type: String },
});

module.exports = mongoose.model('Tag', TagSchema);