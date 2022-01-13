const mongoose = require('mongoose');

const TagsSetSchema = mongoose.Schema({
    name: { type: String },
});

module.exports = mongoose.model('TagsSet', TagsSetSchema);