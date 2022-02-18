const mongoose = require('mongoose');

const PostingSchema = mongoose.Schema({
    name: { type: String },
    applyMethods: [],
    candidateDescription: { type: String },
    company: {},
    compensations: [],
    experiences: [],
    incentives: [],
    jobType: [],
    positions: [],
    qualities: [],
    roleDescription: { type: String },
    showSignature: { type: Boolean },
    signature: { type: String },
    tags: [],
});

module.exports = mongoose.model('Posting', PostingSchema);