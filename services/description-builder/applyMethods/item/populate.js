const ApplyMethod = require("../../../../models/ApplyMethod/ApplyMethod")

exports.populate = async() => {
    let applyMethodsString = `Please submit your resume for consideration
    Please include your full name and current contact info
    Please submit 2 industry-related references from previous supervisors
    Verification of employment eligibility required (**16 years old and authorized to work in the US**)`
    let applyMethodsArray = applyMethodsString.split(`\n`);
    await ApplyMethod.deleteMany({});
    applyMethodsArray.forEach((item => ApplyMethod.create({ name: item.trim() })));
}