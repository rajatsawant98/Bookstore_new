const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    author_name : {
        type : String,
        unique : true,
        required : true,
        unique: true
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
        enum: ['author'],
        required: true,
        default: 'author',
        immutable: true
    }

})


module.exports = mongoose.model('Author', authorSchema)