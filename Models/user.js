const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, 
        ref: 'Book'
    },
    quantity :{
        type: Number
    }
    
}, { _id: false });

const userSchema = new mongoose.Schema({
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
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
    booksInCart : [cartSchema],
    role: {
        type: String,
        enum: ['user'],
        required: true,
        default: 'user',
        immutable: true
    }

})


module.exports = mongoose.model('User', userSchema)