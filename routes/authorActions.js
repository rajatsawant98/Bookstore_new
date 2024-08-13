const express = require('express');
const router = express.Router();
const upload = require('../upload');

const { authenticateToken } = require('../controllers/loginControllers')

const {addBookAuthor, getAuthorBooks, deleteBook, getBookById} = require('../controllers/authControllers');

router.post('/addBookAuthor', authenticateToken, upload.single('bookPhoto'), addBookAuthor);

router.get('/books', authenticateToken, getAuthorBooks);

router.delete('/removeBook', authenticateToken, deleteBook);

router.post('/book', authenticateToken, getBookById);

module.exports = router