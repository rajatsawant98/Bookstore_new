const express = require('express')
const router = express.Router()

// const Book = require('../models/bookSchema')

const {getAllBooks,getBookByName,addBook,editStock,deleteBook,getAllAuthors,
    addAuthor,getBooksAndAuthors,getAveragePriceByAuthor , getBooks, getBookById} = require('./controllers');


router.get('/all', getBooks);
router.get('/name/:name', getBookByName);

router.post('/addBook',addBook);

router.post('/editStock', editStock);

router.delete('/deleteBook', deleteBook);



router.get('/:id', getBookById);

router.get('/getAuthors', getAllAuthors);

router.post('/addAuthor', addAuthor);

router.get('/allbooks', getBooksAndAuthors);

router.get('/avg', getAveragePriceByAuthor)

// router.get('/',getBooksByAuthor)

module.exports = router