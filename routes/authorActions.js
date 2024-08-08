const express = require('express')
const router = express.Router()
const upload = require('../uploads/upload');

const {addBookAuthor, getAuthorBooks, deleteBook} = require('../controllers/authControllers');

router.post('/addBookAuthor', upload.single('bookPhoto'), addBookAuthor);

router.get('/books', getAuthorBooks);

router.delete('/removeBook/:bookId', deleteBook);

module.exports = router