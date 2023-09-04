const mongoose = require("mongoose");

const JobSchema = mongoose.Schema({
  job_id: { type: String },
  legacyId: { type: String },
  location: { type: String },
  email: { type: String },
  company: { type: String },
  status: { type: String },
  budget_amount: { type: String },
  budget_cost: { type: String },
  budget_plan: { type: String },
  budget_endDate: { type: String },
  jobTitle: { type: String },
  country: { type: String },
  dateCreated: { type: String },
  hiresNeeded: { type: String },
  minSalary: { type: String },
  maxSalary: { type: String },
  salaryPeriod: { type: String },
  salaryRange: { type: String },
  description: { type: String },
  descriptionHtml: { type: String },
  expectedHireDate: { type: String },
  type: { type: String },
  benefits: [],
});

module.exports = mongoose.model("Job", JobSchema);
