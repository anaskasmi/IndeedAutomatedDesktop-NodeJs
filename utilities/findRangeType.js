module.exports.findRangeType = async(jobDetails_SalaryFrom, jobDetails_SalaryTo) => {
    let salaryRangeType = null;
    if (jobDetails_SalaryFrom && jobDetails_SalaryTo) {
        salaryRangeType = "RANGE";
    } else if (jobDetails_SalaryFrom) {
        salaryRangeType = "STARTING_AT";
    } else if (jobDetails_SalaryTo) {
        salaryRangeType = "UP_TO";
    }

    return salaryRangeType;
}