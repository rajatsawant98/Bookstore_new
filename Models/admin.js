const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    username : {
        type : String,
        unique : true,
        required : true
    },
    email:{
        type : String,
        unique : true,
        required : true
    },
    password: { type: String, required: true },
    age:{
        type : Number,
        required : true
    },
    address:{
        type : String,
        required : true
    },
    gender: {
        type: String,
        required: true
    }, 
    role: {
        type: String,
        enum: ['SuperAdmin', 'Librarian', 'Bookkeeper'],
        required: true
    }

})


module.exports = mongoose.model('Admin', adminSchema)