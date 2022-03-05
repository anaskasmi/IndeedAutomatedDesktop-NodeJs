const CrelateReportsService = require("../../services/crelate-reports/CrelateReportsService");

let CrelateReportsController = {};

CrelateReportsController.generateReport = async function(req, res) {
    req.setTimeout(0);
    try {
        await CrelateReportsService.generateReport(req.body.jobsNumbers);
        return res.status(200).json({ 'msg': "generated successfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error });
    }
}

module.exports = CrelateReportsController;