const Author = require('../Models/author');
const Book = require('../models/bookSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


async function addBookAuthor(req, res) {
    const { isbn, book_name, genre, price, isSold, countInStock } = req.body; 
    const photo = req.file ? req.file.path : null;
    const authorId = req.user.id;
    console.log("authorId from accessToken : " , authorId )

    try {
        const author = await Author.findById(authorId);

        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }

        const book = new Book({
            isbn,
            book_name,
            genre,
            author: author._id,
            price,
            isSold,
            countInStock,
            photo
        });

        const savedBook = await book.save();
        res.json(savedBook);

    } catch (err) {
        res.status(500).json({ message: 'Error in addBook function', error: err.message });
    }
}




async function getAuthorBooks(req, res) {
    try {
        const authorId = req.user.id;
        console.log('authorId from accesstoken :', authorId);

        // Find books by the author
        const books = await Book.find({ author: authorId });

        // Return the books to the client
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'An error occurred while fetching books.' });
    }
}


async function deleteBook (req, res) {
    try {
        const { bookId } = req.body;
        const authorId = req.user.id;

        // Verify if the book exists and belongs to the author
        const book = await Book.findOne({ _id: bookId, author: authorId });
        if (!book) {
            return res.status(404).json({ message: 'Book not found or you do not have permission to delete this book.' });
        }

        // Delete the book
        await Book.deleteOne({ _id: bookId });
        
        res.status(200).json({ message: 'Book successfully removed.' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'An error occurred while deleting the book.' });
    }
}

async function getBookById(req, res) {
    const { bookId } = req.body;

    try {
        const book = await Book.findById(bookId).populate('author').exec();
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book details', error: error.message });
    }
}




module.exports = {
    addBookAuthor, 
    getAuthorBooks,
    deleteBook,
    getBookById
    };
