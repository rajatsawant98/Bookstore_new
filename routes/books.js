const express = require('express')
const router = express.Router()
const upload = require('../uploads/upload');

// const Book = require('../models/bookSchema')

const {getAllBooks,getBookByName,addBook,editStock,deleteBook,getAllAuthors,addBookAuthor,authorize, authenticateToken, 
    addAuthor,getBooksAndAuthors,getAveragePriceByAuthor , getBooks, getBookById} = require('./controllers');


router.get('/all', getBooks);
router.get('/name/:name', getBookByName);

router.post('/addBook', authenticateToken,authorize(['SuperAdmin', 'Bookkeeper']) ,upload.single('bookPhoto'), addBook);

router.post('/addBookAuthor', upload.single('bookPhoto'), addBookAuthor);

router.post('/editStock', authenticateToken,authorize(['SuperAdmin', 'Bookkeeper']), editStock);

router.delete('/deleteBook',authenticateToken,authorize(['SuperAdmin', 'Bookkeeper']),  deleteBook);

router.get('/:id', getBookById);

router.get('/getAuthors', getAllAuthors);

router.post('/addAuthor', addAuthor);

router.get('/allbooks', getBooksAndAuthors);

router.get('/avg', getAveragePriceByAuthor)

// router.get('/',getBooksByAuthor)

module.exports = router