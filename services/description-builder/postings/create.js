const Posting = require("../../../models/Posting/Posting")

exports.create = async(data) => {
    return Posting.create({
        name: data.name,
        applyMethods: data.applyMethods,
        candidateDescription: data.candidateDescription,
        company: data.company,
        compensations: data.compensations,
        experiences: data.experiences,
        incentives: data.incentives,
        jobType: data.jobType,
        positions: data.positions,
        qualities: data.qualities,
        roleDescription: data.roleDescription,
        showSignature: data.showSignature,
        signature: data.signature,
        tags: data.tags,
    });
}