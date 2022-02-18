//packages
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const shell = require('shelljs');

const main = () => {
    //config
    const app = express();
    app.use(cors())


    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
        next();
    });
    console.log('updater running ');
    //LISTENING
    app.listen(3010);
    shell.exec(`npx kill-port 3009`);
    if (process.env.CURRENT_USER != "ANAS") {
        // shell.exec(`git stash`);
    }
    shell.exec(`git pull origin master`);
    shell.exec(`npm i`);
    shell.exec(`node app`);
};
main();