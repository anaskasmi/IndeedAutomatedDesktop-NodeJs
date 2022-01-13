const mongoose = require('mongoose');

const PositionsSetSchema = mongoose.Schema({
    name: { type: String },
    positions: [{ type: Schema.Types.ObjectId, ref: 'Position' }]
});

module.exports = mongoose.model('PositionsSet', PositionsSetSchema);