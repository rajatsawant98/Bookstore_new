const { Long } = require('mongodb');
const Author = require('../Models/author');
const Book = require('../models/bookSchema');
const User = require('../Models/user');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
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

// async function getAllBooks(req, res) {
//     try{
//         if(req.query.actor === "author"){
//             const authorVar = req.query.author
//             const book = await Book.find({author:authorVar})
//             res.json(book)
//         }
//         else{
//             const book = await Book.find()
//             res.json(book)
//         }
        
//     }catch(err){
//         res.status(500).json({ message: 'Error', error: err.message });
//     }
// }


async function getBookByName (req, res) {
    try {
        if(req.query.buy === "true"){
            const book = await Book.findOne({ book_name: req.params.name });
            if(book.countInStock > 0){
                book.countInStock -= 1
                book.isSold = "true"
                const b1 = await book.save()
                res.json(b1)
            }
            else if (book.countInStock <= 0) {
            return res.status(404).json({ message: 'Book not in stock' });
            }
            else if (!book){
                return res.status(404).json({ message: 'Book not found in buy' });
            }
        }
        else{
            const book = await Book.findOne({ book_name: req.params.name });
            if(!book){
                return res.status(404).json({ message: 'Book not found in not buy' });
            }
            else{
                res.json(book);
            }
        }
        
    } catch (err) {
        res.status(500).json({ message: 'Error', error: err.message });
    }
}




// async function addBook(req, res) {
//     const { isbn, book_name, genre, price, isSold, countInStock,author_name } = req.body; 

//     try {
//         const author = await Author.findOne({ author_name: author_name });
        
//         if (!author) {
//             return res.status(404).json({ message: 'Author not found' });
//         }

//         const book = new Book({
//             isbn,
//             book_name,
//             genre,
//             author: author._id,
//             price,
//             isSold,
//             countInStock
//         });

//         const savedBook = await book.save();
//         res.json(savedBook);

//     } catch (err) {
//         res.status(500).json({ message: 'Error', error: err.message });
//     }
// }



async function addBook(req, res) {
    console.log("addBook getting called");
    const { isbn, book_name, genre, price, isSold, countInStock, author_name } = req.body; 
    const photo = req.file ? req.file.path : null;

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
            photo
        });

        const savedBook = await book.save();
        res.json(savedBook);

    } catch (err) {
        res.status(500).json({ message: 'Error in addBook function', error: err.message });
    }
}



// async function editStock(req, res) {
//     try {
//         const book = await Book.findById(req.params.id);
//         if (!book) {
//             return res.status(404).json({ message: 'Book not found' });
//         }


//         if (req.body.isbd_number !== undefined) book.isbd_number = req.body.isbd_number;
//         if (req.body.book_name !== undefined) book.book_name = req.body.book_name;
//         if (req.body.genre !== undefined) book.genre = req.body.genre;
//         if (req.body.author !== undefined) book.author = req.body.author;
//         if (req.body.price !== undefined) book.price = req.body.price;
//         if (req.body.isSold !== undefined) book.isSold = req.body.isSold;
//         if (req.body.countInStock !== undefined) book.countInStock += req.body.countInStock;

//         const updatedBook = await book.save();
//         res.json(updatedBook);
//     } catch (err) {
//         res.status(500).json({ message: 'Error', error: err.message });
//     }
// }


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






async function getAllAuthors(req, res) {
    try{  
            const author = await Author.find()
            res.json(author)
    }catch(err){
        res.status(500).json({ message: 'Error', error: err.message });
    }
}


async function addAuthor(req, res) {
    const author = new Author({
        author_name : req.body.author_name,
        age : req.body.age,
        address : req.body.address,
        gender : req.body.gender
    })

    try{
        const a1 = await author.save()
        res.json(a1)
    }catch(err){
        res.status(500).json({ message: 'Error', error: err.message });
    }
}


async function getBooksAndAuthors(req, res){
    try {
        const book = await Book.find().populate({path:'author', select: 'author_name age'});
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: 'Error', error: err.message });
    }
}


async function getAllBooks(req, res) {
    try {
        const { author, genre, sortbyprice } = req.query;
        let booksQuery = {};

        if (author) {
            const authorDoc = await Author.findOne({ author_name: author });
            if (!authorDoc) {
                return res.status(404).json({ message: 'Author not found' });
            }
            booksQuery.author = authorDoc._id;
        }

        if (genre) {
            booksQuery.genre = genre;
        }

        let query = Book.find(booksQuery).populate('author', 'author_name');

        if (sortbyprice === 'true') {
            query = query.sort({ price: -1 }); 
        }

        const books = await query.exec(); 

        res.json(books);
    } catch (err) {
        res.status(500).json({ message: 'Error', error: err.message });
    }
}


async function getBooks(req, res) {
    try {
        const books = await Book.find().populate('author'); // Populate author details if needed
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(556).json({ message: 'Failed to fetch books' });
    }
}



async function getAveragePriceByAuthor(req, res) {
    try {
        // Perform aggregation to calculate the average price of books grouped by author name
        const result = await Book.aggregate([
            { $group: { 
                _id: "$author", 
                averagePrice: { $avg: "$price" } 
            }},
            { $lookup: {
                from: "authors", 
                localField: "_id", 
                foreignField: "_id", 
                as: "authorInfo" 
            }},
            { $unwind: "$authorInfo" },
            { $project: {
                _id: 0,
                author_name: "$authorInfo.author_name",
                averagePrice: 1
            }}
        ]);

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Error', error: err.message });
    }
}


async function getBookById(req, res){

    try {
        const book = await Book.findById(req.params.id).populate('author').exec();
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book details', error: error.message });
    }
}


async function addBookAuthor(req, res) {
    const { isbn, book_name, genre, price, isSold, countInStock } = req.body; 
    const photo = req.file ? req.file.path : null;
    const { authorId } = req.cookies
    console.log("authorId from cookies : " , authorId )

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

module.exports = {
    authenticateToken,
    authorize,
    addBookAuthor,
    getAllBooks,
    getBookByName,
    addBook,
    editStock,
    deleteBook,
    getAllAuthors,
    addAuthor,
    getBooksAndAuthors,
    getAveragePriceByAuthor,
    getBooks,
    getBookById
};
