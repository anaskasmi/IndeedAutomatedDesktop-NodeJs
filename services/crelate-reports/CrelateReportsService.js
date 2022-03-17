const Moment = require('moment');
const axios = require("axios");
const ExcelJS = require('exceljs');
const path = require('path');

let CrelateReportsService = {};

CrelateReportsService.generateReport = async(jobsNumbers = []) => {
    const durationOfRecentJobsInMinutes = 60 * 24 * 30;
    let jobs = [];
    let response = await axios.get("https://app.crelate.com/api/pub/v1/jobs/recent", { params: { "api_key": process.env.CRELATE_API_KEY, take: 500, modified: durationOfRecentJobsInMinutes } });
    if (response.status != 200) {
        throw Error('Crelate API Problem, enpoint : v1/jobs/recent');
    }
    jobs = [...response.data.Results, ...jobs]
    let moreRecordsAvailable = response.data.MoreRecords;
    while (moreRecordsAvailable) {
        response = await axios.get("https://app.crelate.com/api/pub/v1/jobs/recent", { params: { "api_key": process.env.CRELATE_API_KEY, take: 500, modified: durationOfRecentJobsInMinutes } });
        if (response.status != 200) {
            throw Error('Crelate API Problem, enpoint : v1/jobs/recent');
        }
        jobs = [...response.data.Results, ...jobs]
        moreRecordsAvailable = response.data.MoreRecords;
    }

    console.log('Recent Jobs Found : ' + jobs.length);
    let jobsMatched = [];
    for (const job of jobs) {
        for (const jobNumber of jobsNumbers) {
            if (job.Name.includes(jobNumber)) {
                console.log('Job matched name : ', job.Name);
                jobsMatched.push({ jobName: job.Name, jobId: job.Id, candidates: [] });
            }
        }

    }


    let jobsWithCandidates = await CrelateReportsService.getCandidatesDataPart1(jobsMatched);
    jobsWithCandidates = await CrelateReportsService.getCandidatesDataPart2(jobsWithCandidates);
    jobsWithCandidates = CrelateReportsService.sortJobsAndCandidates(jobsWithCandidates);

    await CrelateReportsService.generateExcelFile(jobsWithCandidates);


};


CrelateReportsService.getCandidatesDataPart1 = async(jobsMatched) => {

    for (const job of jobsMatched) {
        let response = await axios.get(`https://app.crelate.com/api/pub/v2/jobs/${job.jobId}/contacts`, { params: { "api_key": process.env.CRELATE_API_KEY, "take": 500 } });
        if (response.status != 200) {
            throw Error('Crelate API Problem, enpoint : jobs/jobId/contacts');
        }
        let candidatesRetrieved = response.data.Results;
        for (const candidateRetrieved of candidatesRetrieved) {
            if (candidateRetrieved.StageName == "Submitted" || candidateRetrieved.StageName == "Placed" || candidateRetrieved.StageName == "Pass")
                job.candidates.push({
                    candidateName: candidateRetrieved.Name,
                    candidateId: candidateRetrieved.Id,
                    stageName: candidateRetrieved.StageName,
                    createdOn: Moment(candidateRetrieved.CreatedOn)
                });
        }
    }
    return jobsMatched;

};



CrelateReportsService.getCandidatesDataPart2 = async(jobsWithCandidates) => {

    for (const jobWithCandidates of jobsWithCandidates) {
        for (const candidate of jobWithCandidates.candidates) {
            let response = await axios.get(`https://app.crelate.com/api/pub/v1/contacts/${candidate.candidateId}`, { params: { "api_key": process.env.CRELATE_API_KEY, } });
            if (response.status != 200) {
                throw Error('Crelate API Problem, enpoint : contacts/id');
            }
            let candidateData = response.data;
            candidate.phone = candidateData.PhoneNumber_Fax || candidateData.PhoneNumber_Home || candidateData.PhoneNumber_Mobile || candidateData.PhoneNumber_Other || candidateData.PhoneNumber_Skype || candidateData.PhoneNumber_WorkDirect || candidateData.PhoneNumber_WorkMain;
            candidate.email = candidateData.EmailAddress_Other || candidateData.EmailAddress_Personal || candidateData.EmailAddress_Work;
            candidate.source = candidateData.Source_Name;
        }
    }
    return jobsWithCandidates;

};
CrelateReportsService.sortJobsAndCandidates = (jobsWithCandidates) => {
    for (const jobWithCandidates of jobsWithCandidates) {

        jobWithCandidates.candidates = jobWithCandidates.candidates.sort(
            function(a, b) {
                if (a.stageName == b.stageName) {
                    // Date is only important when stageName are the same
                    return b.createdOn.isAfter(a.createdOn) ? 1 : -1;
                } else if (b.stageName == "Placed") {
                    return 1;
                } else if (b.stageName == "Submitted" && a.stageName == "Pass") {
                    return 1;
                } else {
                    return -1;
                }
            });
    }
    return jobsWithCandidates;
};

CrelateReportsService.generateExcelFile = async(jobsWithCandidates) => {

    // create new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'John McCaffrey';
    const worksheet = workbook.addWorksheet('Report MEP Crelate', { views: [{ showGridLines: true }] });

    // insert headers
    worksheet.columns = [
        { header: 'Job', },
        { header: '', width: 1 },
        { header: 'Job Stage' },
        { header: '', width: 1 },
        { header: 'Name' },
        { header: '', width: 1 },
        { header: 'Source' },
        { header: '', width: 1 },
        { header: 'Date Added' },
        { header: '', width: 1 },
        { header: 'Phone Number' },
    ];


    // insert rows starting from 2 because 1 has headers
    let currentRowIndex = 2;
    let longestJobNameLength = 0;
    let longestCandidateNameLength = 0;
    for (const job of jobsWithCandidates) {
        if (longestJobNameLength < job.jobName.length) {
            longestJobNameLength = job.jobName.length;
        }
        // inserting job title row
        worksheet.mergeCells(`A${currentRowIndex}:K${currentRowIndex}`);
        worksheet.getCell(`A${currentRowIndex}`).value = `${job.jobName} (${job.candidates?.length} candidates)`;
        worksheet.getRow(currentRowIndex).eachCell(function(cell) {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'e0e0e0' },
                bgColor: { argb: 'e0e0e0' }
            };
        });;
        currentRowIndex++;

        // insert candidates
        for (const candidate of job.candidates) {
            if (longestCandidateNameLength < candidate.candidateName.length) {
                longestCandidateNameLength = candidate.candidateName.length;
            }
            let rowValues = [];
            rowValues[1] = job.jobName;
            rowValues[3] = candidate.stageName;
            rowValues[5] = candidate.candidateName;
            rowValues[7] = candidate.source;
            rowValues[9] = candidate.createdOn.format("MM/DD/YYYY");
            rowValues[11] = candidate.phone;
            worksheet.insertRow(currentRowIndex, rowValues);
            currentRowIndex++;
        }
    }


    // style all worksheet
    worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
        row.font = { size: 11, bold: false };
        if (rowNumber == 1) {
            row.eachCell(function(cell, colNumber) {
                cell.border = {
                    top: { style: 'thin', },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = {
                    vertical: 'middle',
                };

                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '2c2e3e' },
                    bgColor: { argb: '2c2e3e' }
                };
            });
        } else {
            row.eachCell(function(cell, colNumber) {
                cell.alignment = {
                    vertical: 'middle',
                };

            });
        }

    });


    // style headers 
    worksheet.getRow(1).font = { size: 11, bold: true, color: { argb: '33ff66 ' }, };

    //make columns full width
    worksheet.columns.forEach(function(column, i) {
        if (i == 1 || i == 3 || i == 5 || i == 7 || i == 9) {
            column.width = 5;
        } else {
            if (i == 0) {
                column.width = longestJobNameLength;
            } else if (i == 4) {
                column.width = longestCandidateNameLength;
            } else {
                column.width = 20;
            }
        }
    });


    const homeDir = require('os').homedir();
    try {
        const desktopDir = `${homeDir}/Desktop/crelate-report.xlsx`;
        await workbook.xlsx.writeFile(desktopDir);
    } catch (error) {
        const desktopDir = `${homeDir}/Desktop/crelate-report.xlsx`;
        await workbook.xlsx.writeFile(desktopDir);
    }
    return true;

};
module.exports = CrelateReportsService;