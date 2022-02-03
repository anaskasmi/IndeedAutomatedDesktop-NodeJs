const mongoose = require('mongoose');

const CompensationsSetSchema = mongoose.Schema({
    name: { type: String },
    compensations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Compensation' }]
});

module.exports = mongoose.model('CompensationsSet', CompensationsSetSchema);