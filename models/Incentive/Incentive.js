const mongoose = require('mongoose');

const IncentiveSchema = mongoose.Schema({
    name: { type: String },
});

module.exports = mongoose.model('Incentive', IncentiveSchema);