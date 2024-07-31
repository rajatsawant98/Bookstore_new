const express = require('express')
const router = express.Router()

const {getAllAuthors,addAuthor, deleteAuthor, authorLogin, getAuthorBooks, deleteBook} = require('./authControllers');

router.get('/', getAllAuthors);

router.post('/addAuthor',  addAuthor);

router.delete('/deleteAuthor', deleteAuthor);

router.post('/login', authorLogin)

router.get('/books', getAuthorBooks)

router.delete('/removeBook/:bookId', deleteBook);

module.exports = router