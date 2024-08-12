const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    rating: { type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    comment: { type: String, 
        required: false 
    }
}, { _id: false });

const bookSchema = new mongoose.Schema({
    isbn:{
        type: Number,
        required: true
    },
    book_name : {
        type : String,
        unique : true,
        required : true,
        unique: true
    },
    genre:{
        type : String,
        required : true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isSold: {
        type : Boolean,
        required: false,
        default: false
    },
    countInStock:{
        type : Number,
        required : false,
        default : 0
    },
    reviews: [reviewSchema],
    photos: [{ 
        type: String,
        required: false
    }]
}, { timestamps: true })





module.exports = mongoose.model('Book', bookSchema)