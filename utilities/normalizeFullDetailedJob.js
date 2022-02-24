const Job = require('../models/Job');

module.exports.normalizeFullDetailedJob = async(unormalizedJobFromJobPage) => {
    return new Job({
        job_id: unormalizedJobFromJobPage.job.id,
        status: unormalizedJobFromJobPage.job.status,
        jobTitle: unormalizedJobFromJobPage.job.title,
        companyName: unormalizedJobFromJobPage.job.company,

        //?one city for example
        advertisingLocationType: unormalizedJobFromJobPage.job.attributes.advertisingLocationType ? unormalizedJobFromJobPage.job.attributes.advertisingLocationType : null,
        //job details
        jobDetails_WhatTypeOfJobIsIt: unormalizedJobFromJobPage.job.type ? unormalizedJobFromJobPage.job.type : null,
        jobDetails_salaryRangeType: unormalizedJobFromJobPage.job.attributes.salaryRangeType ? unormalizedJobFromJobPage.job.attributes.salaryRangeType : null,
        jobDetails_SalaryFrom: unormalizedJobFromJobPage.job.salary1 ? unormalizedJobFromJobPage.job.salary1 : null,
        jobDetails_SalaryTo: unormalizedJobFromJobPage.job.salary2 ? unormalizedJobFromJobPage.job.salary2 : null,
        jobDetails_SalaryPer: unormalizedJobFromJobPage.job.salaryPeriod ? unormalizedJobFromJobPage.job.salaryPeriod : null,
        jobDetails_hiresNeeded: unormalizedJobFromJobPage.job.attributes.hiresNeeded ? unormalizedJobFromJobPage.job.attributes.hiresNeeded : null,
        jobDetails_intHiresNeeded: unormalizedJobFromJobPage.job.attributes.intHiresNeeded ? unormalizedJobFromJobPage.job.attributes.intHiresNeeded : null,
        jobDetails_expectedHireDate: unormalizedJobFromJobPage.job.attributes.expectedHireDate ? unormalizedJobFromJobPage.job.attributes.expectedHireDate : null,
        jobDetails_roleLocationType: unormalizedJobFromJobPage.job.attributes.roleLocationType ? unormalizedJobFromJobPage.job.attributes.roleLocationType : null,
        jobDetails_type: unormalizedJobFromJobPage.job.type ? unormalizedJobFromJobPage.job.type : null,
        primaryJobLocation: unormalizedJobFromJobPage.job.displayLocation ? unormalizedJobFromJobPage.job.displayLocation : null,
        //budget
        budget_outOfBudget: unormalizedJobFromJobPage.job.outOfBudget ? unormalizedJobFromJobPage.job.outOfBudget : null,
        // budget_amount: unormalizedJobFromJobPage.job.budget ? unormalizedJobFromJobPage.job.budget : null,
        budget_maxCPC: unormalizedJobFromJobPage.job.maxcpc ? unormalizedJobFromJobPage.job.maxcpc : null,
        budget_plan: unormalizedJobFromJobPage.job.budgetType ? unormalizedJobFromJobPage.job.budgetType : null,
        // budget_endDate: unormalizedJobFromJobPage.job.displayEndDate ? unormalizedJobFromJobPage.job.displayEndDate : null,
        //description
        jobDescription: unormalizedJobFromJobPage.job.description ? unormalizedJobFromJobPage.job.description : null,
        jobDescriptionHtml: unormalizedJobFromJobPage.job.descriptionHtml,
        //home page
        country: unormalizedJobFromJobPage.job.country || null,
        budget_displayCost: unormalizedJobFromJobPage.job.displayCost || null,
        applicationCount: unormalizedJobFromJobPage.job.newCandidateCount,

        dateCreated: unormalizedJobFromJobPage.job.dateCreated || null,
        budget_endDate: unormalizedJobFromJobPage.job.displayEndDate || null,
        displayLocation: unormalizedJobFromJobPage.job.locations || null,
        budget_amount: unormalizedJobFromJobPage.job.budget || null,
        jobDetails_emails: unormalizedJobFromJobPage.job.emails || null,
    });


}