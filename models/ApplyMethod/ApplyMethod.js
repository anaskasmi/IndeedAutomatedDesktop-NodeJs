const mongoose = require('mongoose');

const ApplyMethodSchema = mongoose.Schema({
    name: { type: String },
});

module.exports = mongoose.model('ApplyMethod', ApplyMethodSchema);