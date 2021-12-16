//https: //analytics.indeed.com/analytics/performance/jobs?startDate=2021-11-07&endDate=2021-12-03
require('dotenv').config();

//services
const IndeedInvoiceService = require('../services/IndeedInvoiceService');


let IndeedInvoiceController = {};

IndeedInvoiceController.generateInvoice = async function(req, res) {
    try {
        const data = {
            dates: req.body.dates,
            jobsNumbers: req.body.jobsNumbers,
        };
        await IndeedInvoiceService.generateInvoice(data);
        return res.status(200).json({ 'msg': "opened successfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });

    }
}
module.exports = IndeedInvoiceController;