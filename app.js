//packages
const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectToMongoDb } = require('./utilities/connectToMongoDb');
const path = require('path')
require('dotenv').config()

connectToMongoDb().then(() => {

    //models
    const jobsRouter = require('./routes/jobRoutes');

    //config
    const app = express();

    //middlewares

    app.use(cors())
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({
        limit: '50mb',
        extended: true
    }));


    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
        next();
    });
    //ROUTES
    app.use('/api/description-builder', require('./routes/description-builder/descriptionBuilder.routes'))
    app.use('/api/jobs', jobsRouter);
    app.use('/js', express.static(path.join(__dirname, "/public/dist/js/")));
    app.use('/css', express.static(path.join(__dirname, "/public/dist/css/")));
    app.use('/img', express.static(path.join(__dirname, "/public/dist/img/")));
    app.get('*', function(req, res) {
        res.sendFile('index.html', { root: path.join(__dirname, '/public/dist/') });
    });

    //LISTENING
    app.listen(3009);
})