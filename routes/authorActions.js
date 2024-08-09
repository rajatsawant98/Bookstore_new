const express = require('express');
const router = express.Router();
const upload = require('../uploads/upload');

const { authenticateToken } = require('../controllers/userControllers')

const {addBookAuthor, getAuthorBooks, deleteBook} = require('../controllers/authControllers');

router.post('/addBookAuthor', authenticateToken, upload.single('bookPhoto'), addBookAuthor);

router.get('/books', authenticateToken, getAuthorBooks);

router.delete('/removeBook/:bookId', authenticateToken, deleteBook);

module.exports = router