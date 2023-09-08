const Job = require("../models/Job");

module.exports.normalizeJobs = async (jobsArray) => {
  let normalizedJobs = [];
  for (let unormalizedJob of jobsArray) {
    unormalizedJob = unormalizedJob.employerJob.jobData;
    const normalizedJob = new Job({
      raw : unormalizedJob,
      job_id: unormalizedJob.id,
      legacyId: unormalizedJob.legacyId,
      location: unormalizedJob.location?.formatted?.long,
      email: unormalizedJob.applyMethod?.emails?.[0],
      company: unormalizedJob.company,
      status: unormalizedJob.status,
      budget_amount: unormalizedJob.hostedJobBudget?.amount,
      budget_cost: unormalizedJob.hostedJobBudget?.cost,
      budget_plan: unormalizedJob.hostedJobBudget?.plan,
      budget_endDate: unormalizedJob.hostedJobBudget?.endDate,
      resumeRequired: unormalizedJob.resumeRequired,
      jobTitle: unormalizedJob.title,
      country: unormalizedJob.country,
      dateCreated: unormalizedJob.dateCreated,
      hiresNeeded:
        unormalizedJob.ujlCandidatesPipelineHostedIndeedApplyAttributes?.[0]
          ?.value,
      minSalary: unormalizedJob.salary?.minimumMinor
        ? unormalizedJob.salary?.minimumMinor / 100
        : null,
      maxSalary: unormalizedJob.salary?.maximumMinor
        ? unormalizedJob.salary?.maximumMinor / 100
        : null,
      salaryPeriod: unormalizedJob.salary?.period,
      descriptionHtml: unormalizedJob.formattedDescription.htmlDescription,
      description: unormalizedJob.description,
    });
    normalizedJob.expectedHireDate = unormalizedJob.attributes.find(
      (item) => item.key === "expectedHireDate"
    )?.value;
    // benefits
    normalizedJob.benefits = unormalizedJob.taxonomyAttributes.find(
      (item) => item.customClassUuid === "35828bc2-d934-48c2-a22d-0c8356cd07cc"
    );
    normalizedJob.benefits =
      normalizedJob.benefits?.[0]?.attributes?.map((item) => item.label) || [];

    // job type
    const type = unormalizedJob.taxonomyAttributes.find((item) => {
      return item.customClassUuid == "2b08da1b-fe62-43ee-adbe-7f48c9061d39";
    });

    normalizedJob.type = type?.attributes?.[0]?.label;

    // salary range
    if (normalizedJob.minSalary && normalizedJob.maxSalary) {
      normalizedJob.salaryRange = "RANGE";
    } else if (normalizedJob.minSalary && !normalizedJob.maxSalary) {
      normalizedJob.salaryRange = "STARTING_AT";
    } else if (!normalizedJob.minSalary && normalizedJob.maxSalary) {
      normalizedJob.salaryRange = "UP_TO";
    }

    normalizedJobs.push(normalizedJob);
  }
  return normalizedJobs;
};
