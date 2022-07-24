const Job = require('../models/Job');

module.exports.normalizeFullDetailedJob = async(jobData) => {
    return new Job({
        job_id: jobData.job.id,
        status: jobData.job.status,
        jobTitle: jobData.job.title,
        companyName: jobData.job.company,
        address: jobData.job.address,
        location: jobData.job.locations[0].location,
        //job details
        jobDetails_WhatTypeOfJobIsIt: jobData.job.type ? jobData.job.type : null,
        jobDetails_salaryRangeType: jobData.job.attributes.salaryRangeType ? jobData.job.attributes.salaryRangeType : null,
        jobDetails_SalaryFrom: jobData.job.salary1 ? jobData.job.salary1 : null,
        jobDetails_SalaryTo: jobData.job.salary2 ? jobData.job.salary2 : null,
        jobDetails_SalaryPer: jobData.job.salaryPeriod ? jobData.job.salaryPeriod : null,
        jobDetails_hiresNeeded: jobData.job.attributes.hiresNeeded ? jobData.job.attributes.hiresNeeded : null,
        jobDetails_intHiresNeeded: jobData.job.attributes.intHiresNeeded ? jobData.job.attributes.intHiresNeeded : null,
        jobDetails_expectedHireDate: jobData.job.attributes.expectedHireDate ? jobData.job.attributes.expectedHireDate : null,
        jobDetails_type: jobData.job.type ? jobData.job.type : null,
        //budget
        budget_outOfBudget: jobData.job.outOfBudget ? jobData.job.outOfBudget : null,
        budget_maxCPC: jobData.job.maxcpc ? jobData.job.maxcpc : null,
        budget_plan: jobData.job.budgetType ? jobData.job.budgetType : null,
        //description
        jobDescription: jobData.job.description ? jobData.job.description : null,
        jobDescriptionHtml: jobData.job.descriptionHtml,
        //home page
        country: jobData.job.country || null,
        budget_displayCost: jobData.job.displayCost || null,
        applicationCount: jobData.job.newCandidateCount,

        dateCreated: jobData.job.dateCreated || null,
        budget_endDate: jobData.job.displayEndDate || null,
        budget_amount: jobData.job.budget || null,
        jobDetails_emails: jobData.job.emails || null,
    });


}