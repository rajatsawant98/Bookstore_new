const Author = require('../Models/author');
const Book = require('../models/bookSchema');
const Admin = require('../Models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const roleConfig = require('../routes/roleConfig');




// function authorize(req, res, next) {
//     const path = req.originalUrl; // Get the path of the current route
//     const allowedRoles = roleConfig[path]; // Get the allowed roles for this path from the config

    
//     if (!req.user) return res.status(401).json({ message: 'Authentication required.' });

//     // Check if the user's role is included in the allowed roles
//     if (!allowedRoles || !allowedRoles.includes(req.user.role)) {
//         console.log("Admin not authorized");
//         return res.status(401).json({ message: 'Access denied. Insufficient permissions.' });
//     }

//     next();
// }


async function addBook(req, res) {
    console.log("addBook getting called");
    const { isbn, book_name, genre, price, isSold, countInStock, author_name } = req.body; 
    const photos = req.files ? req.files.map(file => file.path) : [];


    try {
        const author = await Author.findOne({ author_name });

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
            photos
        });

        const savedBook = await book.save();
        res.json(savedBook);

    } catch (err) {
        res.status(500).json({ message: 'Error in addBook function', error: err.message });
    }
}


async function editStock(req, res){
    try {
        const { book_name, countInStock } = req.body;

        // Find the book by name
        const book = await Book.findOne({ book_name }).lean();
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Update the stock count
        book.countInStock += countInStock;

        // Save the updated book
        const updatedBook = await Book.findByIdAndUpdate(book._id, { countInStock: book.countInStock }, { new: true });

        res.json(updatedBook);
    } catch (err) {
        res.status(500).json({ message: 'Error', error: err.message });
    }
}

async function deleteBook(req, res) {
    try {
        const { book_name } = req.body;

        if (!book_name) {
            return res.status(400).json({ message: 'Book name is required' });
        }

        const book = await Book.findOne({ book_name: book_name });

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const result = await book.deleteOne();
        res.json({ message: 'Book deleted successfully', result });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting book', error: err.message });
    }
}

async function deleteUser(req, res) {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        // Find the user by username
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the user
        const deleteUserResult = await User.deleteOne({ username: username });

        return res.status(200).json({
            message: 'User deleted successfully',
            result: deleteUserResult
        });
    } catch (err) {
        return res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
}


async function addAdmin(req, res) {
    try {
        const { username, email, password, age, address, gender, role } = req.body;

        // Validate required fields
        if (!username || !email || !password || !age || !address || !gender || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin
        const newAdmin = new Admin({
            username,
            email,
            password: hashedPassword,
            age,
            address,
            gender,
            role
        });

        // Save the admin to the database
        await newAdmin.save();

        res.status(201).json({ message: 'Admin added successfully' });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: 'Error adding admin', error: err.message });
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


module.exports = {
     addBook, editStock, deleteBook, deleteUser, addAdmin, addAuthor, deleteAuthor
};