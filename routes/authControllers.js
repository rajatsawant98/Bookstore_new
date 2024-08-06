const Author = require('../Models/author');
const Book = require('../models/bookSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
// const User = require('../Models/user');
const TokenBlacklist = require('../Models/blacklist');


const JWT_SECRET = 'cldsjvndafkjvjh^%$%#kjbkjkl98787'


async function authenticateToken(req, res, next) {
    console.log("authenticateToken getting called");
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    // Check if token is blacklisted
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) return res.status(403).json({ message: 'Token in blacklist. Invalid token.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token.' });

        req.user = user;
        next();
    });
}


function authorize(allowedRoles) {
    return (req, res, next) => {
        console.log("authorize middleware getting called");
        if (!req.user) return res.status(401).json({ message: 'Authentication required.' });

        // Check if the user's role is included in the allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            console.log("Admin not authorized");
            return res.status(401).json({ message: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
}

async function authorLogin(req, res){
    const { author_name, password } = req.body;
    const author = await Author.findOne({ author_name });

    if (!author) {
        return res.status(400).json({ message: 'Invalid username/password' });
    }

    if (await bcrypt.compare(password, author.password)) {
        const token = jwt.sign(
            { id: author._id, author_name: author.author_name },
            JWT_SECRET
        );

        res.cookie('authorId', author._id.toString());
        
        console.log('Setting cookie: authorId', author._id.toString());
        return res.status(201).json({ message: 'Author Login successfully', data: token });
        
    } else {
        return res.status(500).json({ message: 'Invalid Username/Password' });
    }
}


async function getAllAuthors(req, res) {
    try{  
            const author = await Author.find()
            res.json(author)
    }catch(err){
        res.status(500).json({ message: 'Error', error: err.message });
    }
}


async function addAuthor(req, res) {
    console.log("addAuthor getting called");
    const { author_name, age, address, gender, password } = req.body;

    try {
        // Check if author already exists
        const existingAuthor = await Author.findOne({ author_name });
        if (existingAuthor) {
            return res.status(400).json({ error: 'Author already exists' });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new author
        const newAuthor = new Author({
            author_name,
            age,
            address,
            gender,
            password: hashedPassword
        });
        
        await newAuthor.save();
        res.status(201).json({ message: 'Author added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred. Please try again.' });
    }
}


async function deleteAuthor(req, res) {
    try {
        const { author_name } = req.body;

        if (!author_name) {
            return res.status(400).json({ message: 'Author name is required' });
        }

        const author = await Author.findOne({ author_name: author_name });

        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }

        // Delete all books related to this author
        const deleteBooksResult = await Book.deleteMany({ author: author._id });
        
        // Delete the author
        const deleteAuthorResult = await author.deleteOne();
        
        return res.status(200).json({
            message: 'Author and related books deleted successfully',
            authorResult: deleteAuthorResult,
            booksDeleted: deleteBooksResult.deletedCount
        });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting author and related books', error: err.message });
    }
}


async function getAuthorBooks(req, res) {
    try {
        const { authorId } = req.cookies
        console.log('authorId from cookies:', authorId);

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
        const { bookId } = req.params;
        const { authorId } = req.cookies;

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




module.exports = {
    getAllAuthors,authorize,authenticateToken, 
    addAuthor,
    deleteAuthor,
    authorLogin,
    getAuthorBooks,
    deleteBook
};
