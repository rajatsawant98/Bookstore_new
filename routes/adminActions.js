const express = require('express')
const router = express.Router()
const upload = require('../upload');
const roleConfig = require('./roleConfig');

const { addBook, editStock, deleteBook, deleteUser, addAdmin, addAuthor, deleteAuthor, authorize} = require('../controllers/adminControllers');

const {authenticateToken} = require('../controllers/loginControllers');

router.post('/addBook', authenticateToken,authorize ,upload.single('bookPhoto'), addBook);

router.post('/editStock', authenticateToken,authorize, editStock);

router.delete('/deleteBook',authenticateToken,authorize,  deleteBook);

router.delete('/deleteUser',authenticateToken , authorize ,deleteUser);

router.post('/admin', authenticateToken , authorize ,addAdmin);

router.post('/addAuthor', authenticateToken , authorize, addAuthor);

router.delete('/deleteAuthor',authenticateToken , authorize,  deleteAuthor);


module.exports = router
