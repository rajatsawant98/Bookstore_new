require('dotenv').config();
const express = require('express');
const path = require('path')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express()
app.use('/', express.static(path.join(__dirname, 'static')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json({ limit: '10mb' }));  // Increase as needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const loginRouter = require('./routes/loginRoutes')
app.use('/login', loginRouter)

const adminRouter = require('./routes/adminActions')
app.use('/admins', adminRouter)

const authorRouter = require('./routes/authorActions')
app.use('/authors', authorRouter)

const userRouter = require('./routes/userActions')
app.use('/users', userRouter)


const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
