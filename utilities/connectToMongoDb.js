const mongoose = require('mongoose');

let connectToMongoDb = function() {
    let mongoDbString;
    if (process.env.CURRENT_USER == 'ANAS') {
        mongoDbString = process.env.MONGO_STRING_ANAS;
        console.log('CURRENT USER :  ANAS')
    } else if (process.env.CURRENT_USER == 'TONYA') {
        mongoDbString = process.env.MONGO_STRING_TONYA
        console.log('CURRENT USER :  TONYA')
    } else if (process.env.CURRENT_USER == 'JOHN') {
        mongoDbString = process.env.MONGO_STRING_JOHN
        console.log('CURRENT USER :  JOHN')
    } else {
        console.log('NO CURRENT USER DEFINED !')
    }
    console.log('connecting...')
    return new Promise((resolve, reject) => {
        mongoose.connect(mongoDbString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        }).catch(async(err) => {
            console.log('Failed to connect to mongo on startup - retrying in 5 sec');
            setTimeout(await connectToMongoDb, 1000);
        });
        mongoose.connection.once('open', () => {
            resolve();
            console.log('connected to database')
        })
    })
}
exports.connectToMongoDb = connectToMongoDb;