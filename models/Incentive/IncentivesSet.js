const mongoose = require('mongoose');

const IncentivesSetSchema = mongoose.Schema({
    name: { type: String },
    incentives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Incentive' }]
});

module.exports = mongoose.model('IncentivesSet', IncentivesSetSchema);