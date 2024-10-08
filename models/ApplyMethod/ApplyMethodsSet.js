const mongoose = require('mongoose');

const ApplyMethodsSetSchema = mongoose.Schema({
    name: { type: String },
    applyMethods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ApplyMethod' }]
});

module.exports = mongoose.model('ApplyMethodsSet', ApplyMethodsSetSchema);