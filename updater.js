//packages
const shell = require('shelljs');

const main = () => {
    console.log('updater checking... ');
    shell.exec(`npx kill-port 3009`);
    if (process.env.CURRENT_USER != "ANAS") {
        shell.exec(`git stash`);
    }
    shell.exec(`git pull origin master`);
    shell.exec(`npm i`);

    console.log('updater done ');
    shell.exec(`node app`);

};
main();