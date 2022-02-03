const mongoose = require('mongoose');

const RoleDescriptionSchema = mongoose.Schema({
    name: { type: String },
});

module.exports = mongoose.model('RoleDescription', RoleDescriptionSchema);