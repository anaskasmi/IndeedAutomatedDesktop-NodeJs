const mongoose = require('mongoose');

const CompensationSchema = mongoose.Schema({
    name: { type: String },
});

module.exports = mongoose.model('Compensation', CompensationSchema);