require('dotenv').config();
const express = require('express');
const mongoose =  require('mongoose');
const path = require('path')
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const TokenBlacklist = require('./Models/blacklist');
const bodyParser = require('body-parser');


const url = process.env.DATABASE_URL;

mongoose.connect(url, {useNewUrlParser:true})

const con = mongoose.connection 

con.on('open', () => {
    console.log('connected...');
})


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
