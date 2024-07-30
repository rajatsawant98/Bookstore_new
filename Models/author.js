const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    author_name : {
        type : String,
        unique : true,
        required : true,
        unique: true
    },
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
    }

})


module.exports = mongoose.model('Author', authorSchema)