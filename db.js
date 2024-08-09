const mongoose = require('mongoose');

const url = process.env.DATABASE_URL;

mongoose.connect(url, {useNewUrlParser:true})

const con = mongoose.connection 

con.on('open', () => {
    console.log('connected...');
})

module.exports = con;