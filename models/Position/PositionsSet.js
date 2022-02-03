const mongoose = require('mongoose');

const PositionsSetSchema = mongoose.Schema({
    name: { type: String },
    positions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Position' }]
});

module.exports = mongoose.model('PositionsSet', PositionsSetSchema);