const CompensationsSet = require("../../../../models/Compensation/CompensationsSet")
exports.findAll = async() => {
    return CompensationsSet.find().populate({ path: 'compensations' });
}