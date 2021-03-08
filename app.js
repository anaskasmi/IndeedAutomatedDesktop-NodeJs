//packages
const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()

//models
const jobsRouter = require('./routes/jobRoutes');

//config
const app = express();

//middlewares

app.use(cors())
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
    next();
});
//MONGO DB
mongoose.connect(process.env.MONGO_STRING, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log('connected to mongo db')
})

//ROUTES
app.use('/api/jobs', jobsRouter);

//LISTENING
app.listen(3000);