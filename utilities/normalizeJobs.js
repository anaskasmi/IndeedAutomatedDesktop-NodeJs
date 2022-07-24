const Job = require('../models/Job');

module.exports.normalizeJobs = async(jobsArray) => {
    let normalizedJobs = [];
    for (const unormalizedJob of jobsArray) {
        const normalizedJob = new Job({
            job_id: unormalizedJob.id ? unormalizedJob.id : null,
            status: unormalizedJob.status ? unormalizedJob.status : null,
            dateCreated: unormalizedJob.dateCreated ? unormalizedJob.dateCreated : null,
            jobDescription: unormalizedJob.description ? unormalizedJob.description : null,
            jobTitle: unormalizedJob.title ? unormalizedJob.title : null,
            budget_amount: (unormalizedJob.budget && unormalizedJob.budget.amount) ? unormalizedJob.budget.amount : null,
            budget_displayCost: (unormalizedJob.budget && unormalizedJob.budget.displayCost) ? unormalizedJob.budget.displayCost : null,
            budget_plan: (unormalizedJob.budget && unormalizedJob.budget.plan) ? unormalizedJob.budget.plan : null,
            budget_endDate: (unormalizedJob.budget && unormalizedJob.budget.endDate) ? unormalizedJob.budget.endDate : null,
            address: unormalizedJob.jobLocations[0].address,
            location: unormalizedJob.jobLocations[0].location,
            country: unormalizedJob.country ? unormalizedJob.country : null,
            applicationCount: (unormalizedJob.applicationCount) ? unormalizedJob.applicationCount : null,
        });
        normalizedJobs.push(normalizedJob);
    }
    return normalizedJobs;
}