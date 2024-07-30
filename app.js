const express = require('express')
// const session = require('express-session');
const mongoose =  require('mongoose')
// const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const url = 'mongodb://localhost/bookstore_main'

mongoose.connect(url, {useNewUrlParser:true})

const con = mongoose.connection 

con.on('open', () => {
    console.log('connected...');
})



const app = express()
app.use('/', express.static(path.join(__dirname, 'static')))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const bookRouter = require('./routes/books')
app.use('/books', bookRouter)

const authorRouter = require('./routes/authors')
app.use('/authors', authorRouter)

const userRouter = require('./routes/users')
app.use('/users', userRouter)

app.listen(8000, () => {
    console.log('Server Started');
})