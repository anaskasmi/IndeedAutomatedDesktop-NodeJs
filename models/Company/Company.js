const mongoose = require('mongoose');

const CompanySchema = mongoose.Schema({
    name: { type: String },
    description: { type: String },
    website: { type: String },
    culture: { type: String },
    city: { type: String },
    state: { type: String },
});

module.exports = mongoose.model('Company', CompanySchema);