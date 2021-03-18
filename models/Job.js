const mongoose = require('mongoose');


const JobSchema = mongoose.Schema({
    //general info start
    job_id: { type: String },
    status: { type: String },
    country: { type: String },
    dateCreated: { type: String },

    jobDescription: { type: String },
    jobDescriptionHtml: { type: String },
    //sgeneral info end

    //budget start
    budget_plan: { type: String },
    budget_outOfBudget: { type: String },
    budget_endDate: { type: String },
    //?Job Budget
    budget_amount: { type: String },
    //?Cost
    budget_displayCost: { type: String },
    //?Max CPC
    budget_maxCPC: { type: String },
    //budget end


    //application count start
    //?candidates
    applicationCount: {},
    //application count end

    //gettingStarted start
    reasonForCompanyNameChange: { type: String },
    companyName: { type: String },
    jobTitle: { type: String },
    ////city,county
    displayLocation: [],
    advertisingLocationType: { type: String },

    //gettingStarted end



    // jobDetails start
    jobDetails_WhatTypeOfJobIsIt: { type: String },
    jobDetails_salaryRangeType: { type: String },
    jobDetails_SalaryFrom: {},
    jobDetails_SalaryTo: {},
    jobDetails_SalaryPer: {},
    jobDetails_hiresNeeded: { type: String },
    jobDetails_intHiresNeeded: { type: String },
    jobDetails_expectedHireDate: { type: String },
    ////MULTIPLE_LOCATIONS
    jobDetails_roleLocationType: { type: String },
    jobDetails_type: { type: String },
    jobDetails_emails: [],
    // jobDetails end



    //Application Setting Start
    applicationSetting_howOftenWouldYouLikeToBeInformedOfNewApplicantsForThisJob: { type: String },
    applicationSetting_doYouWantApplicantsToSubmitAResume: { type: String },
    //Application Setting end


});

module.exports = mongoose.model('Job', JobSchema);