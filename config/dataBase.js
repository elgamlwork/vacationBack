const mongoose = require('mongoose'); 

const dataBaseConnection = async () => {
    await mongoose.connect(process.env.MONGO_URL).then(connect => {
        console.log(`connection successfully at host : ${connect.connection.host}`);
    }).catch(error => {
        console.error(error);
    })
};

module.exports = dataBaseConnection;