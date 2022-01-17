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
        { header: 'Job title', },
        { header: '', width: 1 },
        { header: 'Location' },
        { header: '', width: 1 },
        { header: 'Company' },
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
        var rowValues = [];
        rowValues[1] = job.jobTitle;
        rowValues[3] = job.jobLocation;
        rowValues[5] = job.jobCompany;
        rowValues[7] = parseFloat(job.jobTotalCost);
        rowValues[9] = parseFloat(job.averageCPC);
        rowValues[11] = parseFloat(job.averageCPA);
        worksheet.insertRow(2 + index, rowValues);
    }

    // calculate average of CPA & CPC
    let avgOfCPA = (sumOfCPA / jobsArray.length).toFixed(2);
    let avgOfCPC = (sumOfCPA / jobsArray.length).toFixed(2);

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
                    bgColor: { argb: 'FF00FF00' }
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
    const totalCostCell = worksheet.getCell(`G${jobsArray.length + 2}`);
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
    const totalCostPercentage = worksheet.getCell(`G${jobsArray.length + 3}`);
    totalCostPercentage.value = 0.06;
    totalCostPercentage.numFmt = '0.00%';
    totalCostPercentage.font = { size: 11, bold: true, };
    totalCostPercentage.alignment = {
        vertical: 'middle',
    };

    // add percentage result
    const totalCostPercentageResult = worksheet.getCell(`G${jobsArray.length + 4}`);
    totalCostPercentageResult.value = parseFloat((sumOfTotalCost * .06).toFixed(2));
    totalCostPercentageResult.font = { size: 11, bold: true, };
    totalCostPercentageResult.alignment = {
        vertical: 'middle',
    };

    // add percentage + result sum
    const totalCostPercentageResultSum = worksheet.getCell(`G${jobsArray.length + 5}`);
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

    const avgOfCPCCell = worksheet.getCell(`K${jobsArray.length + 2}`);
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
    worksheet.getColumn(7).numFmt = "$#,##0.00";
    worksheet.getColumn(9).numFmt = "$#,##0.00";
    worksheet.getColumn(11).numFmt = "$#,##0.00";
    // format percentage
    totalCostPercentage.numFmt = '0.00%';



    worksheet.columns.forEach(function(column, i) {
        var maxLength = 0;
        column["eachCell"]({ includeEmpty: true }, function(cell) {
            var columnLength = cell.value ? cell.value.toString().length : 4;
            if (columnLength > maxLength) {
                maxLength = columnLength;
            }
        });
        column.width = maxLength;
    });

    // // style signature
    // worksheet.getCell(`A${jobsArray.length + 3}`).value = 'Kind regards,';
    // worksheet.getCell(`A${jobsArray.length + 3}`).font = { size: 14, color: { argb: '183f77' }, };
    // worksheet.getCell(`A${jobsArray.length + 4}`).value = 'John McCaffrey';
    // worksheet.getCell(`A${jobsArray.length + 4}`).font = { size: 16, bold: true, color: { argb: '183f77' }, };

    // // add logo
    // const logo = workbook.addImage({
    //     filename: 'services/logo.png',
    //     extension: 'png',
    // });
    // worksheet.addImage(logo, {
    //     tl: { col: 0, row: jobsArray.length + 4 },
    //     ext: { width: 60, height: 60 }
    // });



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


    // make sure all headers exists
    await IndeedInvoiceService.checkNeededColumns();

    // get headers indexes
    let headersIndexes = await IndeedInvoiceService.getHeadersIndexes();

    // open numbers list
    await BrowserService.page.waitForXPath(`//*[@id="page-size-options-button"]`);
    let [numbersList] = await BrowserService.page.$x(`//*[@id="page-size-options-button"]`);
    await numbersList.click();

    // click last button
    await BrowserService.page.waitForXPath(`//*[@id="page-size-options-item-5"]`);
    let [lastButton] = await BrowserService.page.$x(`//*[@id="page-size-options-item-5"]`);
    await lastButton.click();

    // parse jobs number
    let jobsArray = await IndeedInvoiceService.parseJobsFromTheTable(data.jobsNumbers, headersIndexes)

    // generate excel
    let filePath = await IndeedInvoiceService.generateExcel(jobsArray);

    console.log(filePath);
    return filePath;



};

IndeedInvoiceService.parseJobsFromTheTable = async(jobsNumbers, headersIndexes) => {
    let jobsArray = [];

    for (const jobNumber of jobsNumbers) {
        // click search bar
        await BrowserService.page.waitForXPath(`//*[@id="input-searchInput"]`);
        let [searchBar] = await BrowserService.page.$x(`//*[@id="input-searchInput"]`);
        await searchBar.click({ clickCount: 3 });

        // type in the job number 
        await BrowserService.page.keyboard.type(jobNumber);

        //wait for table to filter results
        await BrowserService.page.waitForTimeout(4000);
        await BrowserService.page.waitForXPath(`//*[@class="perf-JobTitleCell-content"]/div/a`);

        // get the number of rows
        let rowsNumber = (await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div`)).length;

        for (let currentRowNumber = 1; currentRowNumber <= rowsNumber; currentRowNumber++) {
            let job = {};

            // Job title
            let jobTitleIndex = headersIndexes.find(({ name }) => name === 'Job title').index;
            let [jobTitleHandler] = await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div[${currentRowNumber}]/div/div[${jobTitleIndex}]`);
            job.jobTitle = await BrowserService.page.evaluate(cell => cell.innerText, jobTitleHandler);

            // Location
            let locationIndex = headersIndexes.find(({ name }) => name === 'Location').index;
            let [jobLocationHandler] = await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div[${currentRowNumber}]/div/div[${locationIndex}]`);
            job.jobLocation = await BrowserService.page.evaluate(cell => cell.innerText, jobLocationHandler);

            // Company
            let companyIndex = headersIndexes.find(({ name }) => name === 'Location').index;
            let [jobCompanyHandler] = await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div[${currentRowNumber}]/div/div[${companyIndex}]`);
            job.jobCompany = await BrowserService.page.evaluate(cell => cell.innerText, jobCompanyHandler);

            // Total cost
            let totalCostIndex = headersIndexes.find(({ name }) => name === 'Total cost').index;
            let [jobTotalCostHandler] = await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div[${currentRowNumber}]/div/div[${totalCostIndex}]`);
            job.jobTotalCost = await BrowserService.page.evaluate(cell => cell.innerText, jobTotalCostHandler);
            job.jobTotalCost = job.jobTotalCost.replace('$', '');
            if (!parseFloat(job.jobTotalCost)) {
                job.jobTotalCost = 0;
            }

            // Average CPC
            let AVGCPCIndex = headersIndexes.find(({ name }) => name === 'AVG CPC').index;
            let [averageCPCHandler] = await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div[${currentRowNumber}]/div/div[${AVGCPCIndex}]`);
            job.averageCPC = await BrowserService.page.evaluate(cell => cell.innerText, averageCPCHandler);
            job.averageCPC = job.averageCPC.replace('$', '');
            if (!parseFloat(job.averageCPC)) {
                job.averageCPC = 0;
            }

            // Average CPA
            let AVGCPAIndex = headersIndexes.find(({ name }) => name === 'AVG CPC').index;
            let [averageCPAHandler] = await BrowserService.page.$x(`//*[@id="plugin_container_ReportPage"]/div/div/div/div/div/div/div[5]/div[1]/div/div[2]/div/div[1]/div[${currentRowNumber}]/div/div[${AVGCPAIndex}]`);
            job.averageCPA = await BrowserService.page.evaluate(cell => cell.innerText, averageCPAHandler);
            job.averageCPA = job.averageCPA.replace('$', '');
            if (!parseFloat(job.averageCPA)) {
                job.averageCPA = 0;
            }
            jobsArray.push(job);
        }
    }
    return jobsArray;

}
IndeedInvoiceService.getHeadersIndexes = async() => {
    // wait for page to load 
    await BrowserService.page.waitForXPath(`//*[text()='Job title']/parent::button/parent::div/parent::div/div`);
    let titlesIndexes = [{
            'name': 'Job title',
            'index': null
        },
        {
            'name': 'Location',
            'index': null
        },
        {
            'name': 'Company',
            'index': null
        },
        {
            'name': 'AVG CPA',
            'index': null
        }, {
            'name': 'AVG CPC',
            'index': null
        }, {
            'name': 'Total cost',
            'index': null
        }
    ];
    // get the list of headers 
    let headersList = await BrowserService.page.$x(`//*[text()='Job title']/parent::button/parent::div/parent::div/div`);

    for (const titleObj of titlesIndexes) {
        for (const [index, headerItem] of headersList.entries()) {
            let headertitleText = await BrowserService.page.evaluate(headerItem => headerItem.innerText, headerItem);
            if (titleObj.name == headertitleText) {
                titleObj.index = index + 1;
            }
        }
    }
    console.log(titlesIndexes);
    return titlesIndexes;

};
IndeedInvoiceService.checkNeededColumns = async() => {
    // wait for the columns edit button to load
    await BrowserService.page.waitForXPath(`//*[text()='Edit columns']`);
    await BrowserService.page.waitForTimeout(4000);

    // open it 
    let [editColumnsButton] = await BrowserService.page.$x(`//*[text()='Edit columns']/parent::button`);
    await editColumnsButton.click();

    // TODO : change to select all 
    let requiredCheckBoxes = ['jobCompany', 'location', 'localCosts', 'averageCpc', 'averageCpa']
    for (const requiredCheckBoxe of requiredCheckBoxes) {
        // wait for the checkboxes to show 
        await BrowserService.page.waitForXPath(`//*[@value="${requiredCheckBoxe}"]/parent::label`);
        let isCurrentCheckBoxActive = await BrowserService.page.$x(`//*[@value="${requiredCheckBoxe}" and @checked]`);
        if (isCurrentCheckBoxActive.length == 0) {
            let [currentCheckBoxHandler] = await BrowserService.page.$x(`//*[@value="${requiredCheckBoxe}"]/parent::label`);
            await currentCheckBoxHandler.click();
        }
    }

    // click on Done 
    let [doneButton] = await BrowserService.page.$x(`//*[text()='Done']`)
    await doneButton.click();

};


module.exports = IndeedInvoiceService;