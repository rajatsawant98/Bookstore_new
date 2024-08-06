const express = require('express')
const router = express.Router()

const {getAllAuthors,addAuthor, deleteAuthor, authorLogin, 
    getAuthorBooks, deleteBook, authorize, authenticateToken} = require('./authControllers');

router.get('/', getAllAuthors);

router.post('/addAuthor', authenticateToken , authorize(['SuperAdmin', 'Librarian']), addAuthor);

router.delete('/deleteAuthor',authenticateToken , authorize(['SuperAdmin', 'Librarian']),  deleteAuthor);

router.post('/login', authorLogin);

router.get('/books', getAuthorBooks);

router.delete('/removeBook/:bookId', deleteBook);

module.exports = router