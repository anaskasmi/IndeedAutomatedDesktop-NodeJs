const ExcelJS = require('exceljs');
const { GraphQLClient, gql } = require('graphql-request');
const JobsData = require('./graphQl/queries/JobsData');
const { getHeaders } = require('../utilities/getHeaders');

let IndeedInvoiceService = {};

IndeedInvoiceService.generateExcel = async(jobsArray, jobsNumbers) => {

    // create new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'John McCaffrey';
    const worksheet = workbook.addWorksheet('Invoice MEP', { views: [{ showGridLines: false }] });

    // insert headers
    worksheet.columns = [
        { header: 'Job title', },
        { header: '', width: 1 },
        { header: 'Location' },
        { header: '', width: 1 },
        { header: 'Total Cost' },
        { header: '', width: 1 },
        { header: 'Average CPC' },
        { header: '', width: 1 },
        { header: 'Average CPA' },
    ];

    // prepare empty sums
    let sumOfTotalCost = 0;
    let sumOfCPC = 0;
    let sumOfCPA = 0;

    // insert rows
    for (let index = 0; index < jobsArray.length; index++) {
        const job = jobsArray[index];

        // calculations
        if (parseFloat(job.averageCPC)) {
            sumOfTotalCost = sumOfTotalCost + parseFloat(job.jobTotalCost);
        }

        if (parseFloat(job.averageCPC)) {
            sumOfCPC = sumOfCPC + parseFloat(job.averageCPC);
        }

        if (parseFloat(job.averageCPA)) {
            sumOfCPA = sumOfCPA + parseFloat(job.averageCPA);
        }

        // inserting
        let rowValues = [];
        rowValues[1] = job.jobTitle;
        rowValues[3] = job.jobLocation;
        rowValues[5] = parseFloat(job.jobTotalCost);
        rowValues[7] = parseFloat(job.averageCPC);
        rowValues[9] = parseFloat(job.averageCPA);
        worksheet.insertRow(2 + index, rowValues);
    }

    // calculate average of CPA & CPC
    let avgOfCPA = (sumOfCPA / jobsArray.length).toFixed(2);
    let avgOfCPC = (sumOfCPC / jobsArray.length).toFixed(2);

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

    // add average & total cells
    const totalCostCell = worksheet.getCell(`E${jobsArray.length + 2}`);
    totalCostCell.value = parseFloat(sumOfTotalCost);
    totalCostCell.font = { size: 11, bold: true, };
    totalCostCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ff9d52' },
        bgColor: { argb: 'ff9d52' }
    };
    totalCostCell.alignment = {
        vertical: 'middle',
    };

    // add percentage
    const totalCostPercentage = worksheet.getCell(`E${jobsArray.length + 3}`);
    totalCostPercentage.value = 0.06;
    totalCostPercentage.numFmt = '0.00%';
    totalCostPercentage.font = { size: 11, bold: true, };
    totalCostPercentage.alignment = {
        vertical: 'middle',
    };

    // add percentage result
    const totalCostPercentageResult = worksheet.getCell(`E${jobsArray.length + 4}`);
    totalCostPercentageResult.value = parseFloat((sumOfTotalCost * .06).toFixed(2));
    totalCostPercentageResult.font = { size: 11, bold: true, };
    totalCostPercentageResult.alignment = {
        vertical: 'middle',
    };

    // add percentage + result sum
    const totalCostPercentageResultSum = worksheet.getCell(`E${jobsArray.length + 5}`);
    totalCostPercentageResultSum.value = parseFloat((sumOfTotalCost * .06 + sumOfTotalCost).toFixed(2));
    totalCostPercentageResultSum.font = { size: 11, bold: true, };
    totalCostPercentageResultSum.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ffee52' },
        bgColor: { argb: 'ffee52' }

    };
    totalCostPercentageResultSum.alignment = {
        vertical: 'middle',
    };


    const avgOfCPACell = worksheet.getCell(`I${jobsArray.length + 2}`);
    avgOfCPACell.value = parseFloat(avgOfCPA);
    avgOfCPACell.font = { size: 11, bold: true, };
    avgOfCPACell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ff9d52' },
        bgColor: { argb: 'ff9d52' }
    };
    avgOfCPACell.alignment = {
        vertical: 'middle',
    };

    const avgOfCPCCell = worksheet.getCell(`G${jobsArray.length + 2}`);
    avgOfCPCCell.value = parseFloat(avgOfCPC);
    avgOfCPCCell.font = { size: 11, bold: true, };
    avgOfCPCCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ff9d52' },
        bgColor: { argb: 'ff9d52' }
    };
    avgOfCPCCell.alignment = {
        vertical: 'middle',
    };


    // format money cols
    worksheet.getColumn(5).numFmt = "$#,##0.00";
    worksheet.getColumn(7).numFmt = "$#,##0.00";
    worksheet.getColumn(9).numFmt = "$#,##0.00";
    // format percentage
    totalCostPercentage.numFmt = '0.00%';


    worksheet.columns.forEach(function(column, i) {
        let maxLength = 0;
        column["eachCell"]({ includeEmpty: true }, function(cell) {
            let columnLength = cell.value ? cell.value.toString().length + 5 : 10;
            if (columnLength > maxLength) {
                maxLength = columnLength;
            }
        });
        if (i == 1 || i == 3 || i == 5 || i == 7 || i == 9) {
            column.width = 5;
        } else {
            column.width = maxLength;
        }
    });


    const homeDir = require('os').homedir();
    let jobsNumbersString = jobsNumbers.join(',');
    try {
        const desktopDir = `${homeDir}/Desktop/(${jobsNumbersString}).xlsx`;
        await workbook.xlsx.writeFile(desktopDir);

    } catch (error) {
        const desktopDir = `${homeDir}/Desktop/invoice.xlsx`;
        await workbook.xlsx.writeFile(desktopDir);
    }
    return true;

};



IndeedInvoiceService.generateInvoice = async(data) => {

    if (data.dates.length != 2) {
        throw Error('dates must have start date and end date')
    }

    if (data.jobsNumbers.length == 0) {
        throw Error('a minimum of one job number is required')
    }

    // get jobs from API
    let jobsArray = await IndeedInvoiceService.getJobsFromAPI(data.jobsNumbers, data.dates);

    // generate excel file
    let filePath = await IndeedInvoiceService.generateExcel(jobsArray, data.jobsNumbers);

    return filePath;
};

IndeedInvoiceService.getJobsFromAPI = async(jobNumbers, dates) => {
    const query = gql `${JobsData}`;
    const variables = {
        "tableTotalQueryOptions": {
            "advertiserSet": [],
            "dateRanges": [{
                "from": dates[0].toString(),
                "to": dates[1].toString()
            }],
            "jobCompanyID": [],
            "jobType": "SPONSORED",
            "advertisementID": [],
            "aggJobID": [],
            "normTitle": [],
            "jobCountryRegionCityID": [],
            "measureFilters": [],
            "extraDimensionFilters": []
        },
        "tableSummaryQueryOptions": {
            "advertiserSet": [],
            "dateRanges": [{
                "from": dates[0].toString(),
                "to": dates[1].toString()
            }],
            "jobCompanyID": [],
            "jobType": "SPONSORED",
            "advertisementID": [],
            "aggJobID": [],
            "normTitle": [],
            "jobCountryRegionCityID": [],
            "measureFilters": [],
            "extraDimensionFilters": [],
            "summarize": true
        },
        "tableDetailsQueryOptions": {
            "advertiserSet": [],
            "dateRanges": [{
                "from": dates[0].toString(),
                "to": dates[1].toString()
            }],
            "jobCompanyID": [],
            "jobType": "SPONSORED",
            "advertisementID": [],
            "aggJobID": [],
            "normTitle": [],
            "jobCountryRegionCityID": [],
            "measureFilters": [],
            "extraDimensionFilters": [],
            "limit": 1500,
            "orderBy": [{
                "field": "TITLE",
                "direction": "ASC"
            }]
        }
    }
    const headers = await getHeaders();

    const client = new GraphQLClient("https://apis.indeed.com/graphql?locale=en-US&co=US", { headers })
    let response = await client.request(query, variables);
    const allJobs = response.details.result;
    const filteredJobs = [];
    // loop through jobs 
    for (const job of allJobs) {
        // loop through filter job numbers
        for (const jobNumber of jobNumbers) {
            if (job.title.includes(jobNumber)) {
                filteredJobs.push({
                    jobTitle: job.title,
                    jobLocation: `${job.city}, ${job.regionFullName}`,
                    jobTotalCost: job.sumCostLocal.toFixed(2),
                    averageCPC: job.avgCostPerClickLocal.toFixed(2),
                    averageCPA: job.avgCostPerApplyLocal.toFixed(2),
                });
            }
        }
    }
    return filteredJobs;
}


module.exports = IndeedInvoiceService;