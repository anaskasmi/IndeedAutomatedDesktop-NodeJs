const BrowserService = require("./BrowserService");
const ExcelJS = require('exceljs');
const path = require('path');

let IndeedInvoiceService = {};

let jobsFakeArray = [{
        jobTitle: 'job 1 mlkd mlkdmlk  dmlkmdk mlkdmldk  mlkdmkd mlkdm dlk mdlk dmkdml',
        jobLocation: "ùmldùmdl dlùmd",
        jobCompany: 'odpôp^dod^po',
        jobTotalCost: '43.44',
        averageCPC: "3.3",
        averageCPA: "4.3"
    },
    {
        jobTitle: 'job 2 mlkd mlkdmlk  dmlkmdk mlkdmldk  mlkdmkd mlkdm dlk mdlk dmkdml',
        jobLocation: "ùmldùmdl dlùmd",
        jobCompany: 'odpôp^dod^po',
        jobTotalCost: '43.44',
        averageCPC: "3.3",
        averageCPA: "4.3"
    },
    {
        jobTitle: 'job 3 mlkd mlkdmlk  dmlkmdk mlkdmldk  mlkdmkd mlkdm dlk mdlk dmkdml',
        jobLocation: "ùmldùmdl dlùmd",
        jobCompany: 'odpôp^dod^po',
        jobTotalCost: '43.44',
        averageCPC: "3.3",
        averageCPA: "4.3"
    },
    {
        jobTitle: 'job 4 mlkd mlkdmlk  dmlkmdk mlkdmldk  mlkdmkd mlkdm dlk mdlk dmkdml',
        jobLocation: "ùmldùmdl dlùmd",
        jobCompany: 'odpôp^dod^po',
        jobTotalCost: '43.44',
        averageCPC: "3.3",
        averageCPA: "4.3"
    },
    {
        jobTitle: 'job 5 mlkd mlkdmlk  dmlkmdk mlkdmldk  mlkdmkd mlkdm dlk mdlk dmkdml',
        jobLocation: "ùmldùmdl dlùmd",
        jobCompany: 'odpôp^dod^po',
        jobTotalCost: '43.44',
        averageCPC: "3.3",
        averageCPA: "4.3"
    },
    {
        jobTitle: 'job 6 mlkd mlkdmlk  dmlkmdk mlkdmldk  mlkdmkd mlkdm dlk mdlk dmkdml',
        jobLocation: "ùmldùmdl dlùmd",
        jobCompany: 'odpôp^dod^po',
        jobTotalCost: '43.44',
        averageCPC: "3.3",
        averageCPA: "4.3"
    },
    {
        jobTitle: 'job 7 mlkd mlkdmlk  dmlkmdk mlkdmldk  mlkdmkd mlkdm dlk mdlk dmkdml',
        jobLocation: "ùmldùmdl dlùmd",
        jobCompany: 'odpôp^dod^po',
        jobTotalCost: '43.44',
        averageCPC: "3.3",
        averageCPA: "4.3"
    },
];



IndeedInvoiceService.generateExcel = async(jobsArray) => {

    // create new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'John McCaffrey';
    const worksheet = workbook.addWorksheet('Invoice MEP', { views: [{ showGridLines: false }] });

    // insert headers
    worksheet.columns = [
        { header: 'Job title', width: 50 },
        { header: 'Location', width: 18 },
        { header: 'Company', width: 18 },
        { header: 'Total Cost', width: 18 },
        { header: 'Average CPC', width: 18 },
        { header: 'Average CPA', width: 32 },
    ];

    // prepare empty sums
    let sumOfTotalCost = 0;
    let sumOfCPC = 0;
    let sumOfCPA = 0;

    // insert rows
    for (let index = 0; index < jobsArray.length; index++) {
        const job = jobsArray[index];

        // calculations
        sumOfTotalCost = sumOfTotalCost + parseFloat(job.jobTotalCost);
        sumOfCPC = sumOfCPC + parseFloat(job.averageCPC);
        sumOfCPA = sumOfCPA + parseFloat(job.averageCPA);

        // inserting
        var rowValues = [];
        rowValues[1] = job.jobTitle;
        rowValues[2] = job.jobLocation;
        rowValues[3] = job.jobCompany;
        rowValues[4] = parseFloat(job.jobTotalCost);
        rowValues[5] = parseFloat(job.averageCPC);
        rowValues[6] = parseFloat(job.averageCPA);
        worksheet.insertRow(2 + index, rowValues);
    }

    // calculate average of CPA & CPC
    let avgOfCPA = (sumOfCPA / jobsArray.length).toFixed(2);
    let avgOfCPC = (sumOfCPA / jobsArray.length).toFixed(2);

    // style all worksheet
    worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
        row.font = { size: 14, bold: false };
        row.height = 25;

        row.eachCell(function(cell, colNumber) {
            if (rowNumber == 1) {
                row.height = 20;
                cell.border = {
                    top: { style: 'thin', },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }

            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
            cell.border = {
                bottom: { style: 'thin', color: { argb: '0048f0' } },
            };
        });
    });


    // style headers 
    worksheet.getRow(1).font = { size: 14, bold: true, color: { argb: '3f87c6' }, };

    // add average & total cells
    const totalCostCell = worksheet.getCell(`D${jobsArray.length + 2}`);
    totalCostCell.value = parseFloat(sumOfTotalCost);
    totalCostCell.font = { size: 14, bold: true, color: { argb: '3f87c6' }, };;
    totalCostCell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
    };

    const avgOfCPACell = worksheet.getCell(`E${jobsArray.length + 2}`);
    avgOfCPACell.value = parseFloat(avgOfCPA);
    avgOfCPACell.font = { size: 14, bold: true, color: { argb: '3f87c6' }, };;
    avgOfCPACell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
    };

    const avgOfCPCCell = worksheet.getCell(`F${jobsArray.length + 2}`);
    avgOfCPCCell.value = parseFloat(avgOfCPC);
    avgOfCPCCell.font = { size: 14, bold: true, color: { argb: '3f87c6' }, };;
    avgOfCPCCell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
    };


    // format money cols
    worksheet.getColumn(4).numFmt = "$#,##0.00";
    worksheet.getColumn(5).numFmt = "$#,##0.00";
    worksheet.getColumn(6).numFmt = "$#,##0.00";

    // style signature
    worksheet.getCell(`A${jobsArray.length + 3}`).value = 'Kind regards,';
    worksheet.getCell(`A${jobsArray.length + 3}`).font = { size: 14, color: { argb: '183f77' }, };
    worksheet.getCell(`A${jobsArray.length + 4}`).value = 'John McCaffrey';
    worksheet.getCell(`A${jobsArray.length + 4}`).font = { size: 16, bold: true, color: { argb: '183f77' }, };

    // add logo
    const logo = workbook.addImage({
        filename: 'services/logo.png',
        extension: 'png',
    });
    worksheet.addImage(logo, {
        tl: { col: 0, row: jobsArray.length + 4 },
        ext: { width: 60, height: 60 }
    });


    const homeDir = require('os').homedir();
    const desktopDir = `${homeDir}/Desktop/invoice.xlsx`;
    await workbook.xlsx.writeFile(desktopDir);
    return desktopDir;

};


IndeedInvoiceService.generateInvoice = async(data) => {
    if (data.dates.length != 2) {
        throw Error('dates must have start date and end date')
    }
    if (data.jobsNumbers.length == 0) {
        throw Error('a minimum of one job number is required')
    }
    await BrowserService.page.goto(`https://analytics.indeed.com/analytics/performance/jobs?startDate=${data.dates[0]}&endDate=${data.dates[1]}`, { waitUntil: "load" });
    // open numbers list
    await BrowserService.page.waitForXPath(`//*[@id="page-size-options-button"]`);
    let [numbersList] = await BrowserService.page.$x(`//*[@id="page-size-options-button"]`);
    await numbersList.click();

    // click last button
    await BrowserService.page.waitForXPath(`//*[@id="page-size-options-item-5"]`);
    let [lastButton] = await BrowserService.page.$x(`//*[@id="page-size-options-item-5"]`);
    await lastButton.click();

    // click search bar
    await BrowserService.page.waitForXPath(`//*[@id="input-searchInput"]`);
    let [searchBar] = await BrowserService.page.$x(`//*[@id="input-searchInput"]`);
    await searchBar.click({ clickCount: 3 });

    // type in the job number 
    await BrowserService.page.keyboard.type(data.jobsNumbers[0]);

    //wait for table to filter results
    await BrowserService.page.waitForTimeout(4000);
    await BrowserService.page.waitForXPath(`//*[@class="perf-JobTitleCell-content"]/div/a`);

    // get the number of rows
    let rowsNumber = (await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div`)).length;
    console.log(rowsNumber);
    if (!rowsNumber) {
        console.log('0 job found');
        throw Error('0 Job found');
    }

    let jobsArray = [];
    for (let currentRowNumber = 1; currentRowNumber <= rowsNumber; currentRowNumber++) {
        console.log(currentRowNumber);
        let job = {};
        // Job title
        let [jobTitleHandler] = await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div[${currentRowNumber}]/div/div[2]`);
        job.jobTitle = await BrowserService.page.evaluate(cell => cell.innerText, jobTitleHandler);

        // Location
        let [jobLocationHandler] = await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div[${currentRowNumber}]/div/div[3]`);
        job.jobLocation = await BrowserService.page.evaluate(cell => cell.innerText, jobLocationHandler);

        // Company
        let [jobCompanyHandler] = await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div[${currentRowNumber}]/div/div[4]`);
        job.jobCompany = await BrowserService.page.evaluate(cell => cell.innerText, jobCompanyHandler);

        // Total cost
        let [jobTotalCostHandler] = await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div[${currentRowNumber}]/div/div[10]`);
        job.jobTotalCost = await BrowserService.page.evaluate(cell => cell.innerText, jobTotalCostHandler);
        job.jobTotalCost = job.jobTotalCost.replace('$', '');

        // Average CPC
        let [averageCPCHandler] = await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div[${currentRowNumber}]/div/div[8]`);
        job.averageCPC = await BrowserService.page.evaluate(cell => cell.innerText, averageCPCHandler);
        job.averageCPC = job.averageCPC.replace('$', '');

        // Average CPA
        let [averageCPAHandler] = await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div[${currentRowNumber}]/div/div[9]`);
        job.averageCPA = await BrowserService.page.evaluate(cell => cell.innerText, averageCPAHandler);
        job.averageCPA = job.averageCPA.replace('$', '');
        jobsArray.push(job);
    }


    let filePath = await IndeedInvoiceService.generateExcel(jobsArray);
    console.log(filePath);
    return filePath;



};
module.exports = IndeedInvoiceService;