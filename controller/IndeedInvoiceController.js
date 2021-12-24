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
        let filePath = await IndeedInvoiceService.generateInvoice(data);
        return res.status(200).redirect(filePath);
        // return res.download(filePath);
        // return res.status(200).json({ 'msg': "opened successfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });

    }
}
module.exports = IndeedInvoiceController;