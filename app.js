const express = require('express')
// const session = require('express-session');
const mongoose =  require('mongoose')
// const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const url = 'mongodb://localhost/bookstore_main'
const cron = require('node-cron');
const TokenBlacklist = require('./Models/blacklist');
const bodyParser = require('body-parser');


// const authenticateToken = require('./routes/userControllers/authenticateToken');

// const JWT_SECRET = 'cldsjvndafkjvjh^%$%#kjbkjkl98787'


// async function authenticateToken(req, res, next) {
//     // console.log("token from cookies: ", req.cookies.token);
//     // console.log("Token from headers: ", req.headers);
//     const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]; // Check for token in cookies or Authorization header

//     if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

//     jwt.verify(token, JWT_SECRET, (err, user) => {
//         if (err) return res.status(403).json({ message: 'Invalid token.' });

//         req.user = user;
//         next();
//     });
// }

mongoose.connect(url, {useNewUrlParser:true})

const con = mongoose.connection 

con.on('open', () => {
    console.log('connected...');
})


const app = express()
app.use('/', express.static(path.join(__dirname, 'static')))

app.use(bodyParser.json({ limit: '10mb' }));  // Increase as needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// app.use('/userhome', authenticateToken, (req, res) => {
//     res.sendFile(path.join(__dirname, 'userhome.html'));
// });

const bookRouter = require('./routes/books')
app.use('/books', bookRouter)

const authorRouter = require('./routes/authors')
app.use('/authors', authorRouter)

const userRouter = require('./routes/users')
app.use('/users', userRouter)

cron.schedule('0 13 * * *', async () => {
    console.log('cron job started running');
    try {
        await TokenBlacklist.deleteMany({ expiresAt: { $lt: new Date() } });
        console.log('Expired tokens cleaned up');
    } catch (error) {
        console.error('Error cleaning up expired tokens', error);
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
