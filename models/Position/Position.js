const mongoose = require('mongoose');

const PositionSchema = mongoose.Schema({
    name: { type: String },
});

module.exports = mongoose.model('Position', PositionSchema);