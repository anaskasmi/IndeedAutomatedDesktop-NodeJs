//packages
const express = require('express');
//config
const crelateReportsRouter = express.Router();
//controllers
const CrelateReportsController = require('../../controller/crelate-reports/CrelateReportsController');
//routes
crelateReportsRouter.post('/generateReports', CrelateReportsController.generateReport)


module.exports = crelateReportsRouter;