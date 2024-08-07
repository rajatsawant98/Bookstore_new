const Book = require('../models/bookSchema');
const User = require('../Models/user');
const Admin = require('../Models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../Models/blacklist');



const JWT_SECRET = 'cldsjvndafkjvjh^%$%#kjbkjkl98787'
const JWT_REFRESH_SECRET = 'dfkjvbkd874^%HJKBKJKkjhvjhbkj865KHB&^%^*'


async function getBooks(req, res) {
    try {
        const books = await Book.find().populate('author'); // Populate author details if needed
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(556).json({ message: 'Failed to fetch books' });
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

async function buyBook(req, res) {
    try {
        // console.log("buyBook from server getting called");
        // console.log('Cookies:', req.cookies);
        const { bookId } = req.body;
        console.log('bookId from body:', bookId);
        const userId = req.user.id;
        console.log("userId from req: ", userId);
        // const { userId } = req.cookies
        // console.log('userId from cookies:', userId);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        else if (book.countInStock <= 0) {
            return res.status(404).json({ message: 'Book out of stock' });
        }
        else {
            book.countInStock -= 1;
            book.isSold = "true";
            user.books.push(book._id);
            await book.save();
            await user.save();
            return res.status(200).json({ message: 'Book purchased Successfully' });
        }


    } catch (err) {
        res.status(500).json({ message: 'Error purchasing book', error: err.message });
    }
}


async function addReview(req, res) {
    const { rating, comment, bookId } = req.body; // Retrieve bookId from the body
    const { userId } = req.cookies;

    console.log("BookId from body : ", bookId);
    console.log("userId from cookies : ", userId);

    try {
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const review = {
            user: userId,
            rating: Number(rating),
            comment
        };

        book.reviews.push(review);

        await book.save();
        res.status(201).json({ message: 'Review added' });
    } catch (err) {
        res.status(500).json({ message: 'Error adding review', error: err.message });
    }
}


async function addToCart(req, res) {
    const { bookId } = req.body;
    const userId = req.user.id;
    console.log('userId from accessToken:', userId);

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the book is already in the cart
        const isBookInCart = user.booksInCart.some(cartItem => cartItem.book.equals(bookId));

        if (isBookInCart) {
            return res.status(400).json({ message: 'Book already in cart' });
        } else {
            user.booksInCart.push({ book: bookId, quantity: 1 });
            await user.save();

            res.status(200).json({ message: 'Book added to cart' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred. Please try again.', error: error.message });
    }
}


async function removeFromCart(req, res) {
    const { bookId } = req.body;
    const { userId } = req.cookies

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the book is in the cart
        const cartIndex = user.booksInCart.findIndex(cartItem => cartItem.book.equals(bookId));

        if (cartIndex === -1) {
            return res.status(400).json({ message: 'Book not found in cart' });
        } else {
            user.booksInCart.splice(cartIndex, 1);
            await user.save();

            res.status(200).json({ message: 'Book removed from cart' });
        }


    } catch (error) {
        res.status(500).json({ message: 'An error occurred. Please try again.', error: error.message });
    }getCart
}


async function getCart(req, res) {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId)
            .populate({
                path: 'booksInCart.book',
                populate: {
                    path: 'author',
                    model: 'Author' // Adjust the model name if necessary
                }
            });
        if (!user) {
            return res.status(404).json({ message: 'User not found from cart backend' });
        }
        res.status(200).json({ booksInCart: user.booksInCart });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred. Please try again. in backend', error: error.message });
    }
}


async function checkout(req, res) {
    const { userId } = req.cookies
    console.log('in checkout userId from cookies:', userId);

    try {
        const user = await User.findById(userId).populate('booksInCart.book');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const booksInCart = user.booksInCart;
        const outOfStockBooks = [];

        for (const cartItem of booksInCart) {
            const book = cartItem.book;
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }
            if (book.countInStock <= 0) {
                outOfStockBooks.push(book.book_name);
                continue;
            }
            book.countInStock -= 1;
            book.isSold = true;
            user.books.push(book._id);
            await book.save();
        }

        // Clear the cart after processing
        user.booksInCart = [];
        await user.save();

        if (outOfStockBooks.length > 0) {
            return res.status(200).json({ message: `Some books were out of stock: ${outOfStockBooks.join(', ')}` });
        }

        res.status(200).json({ message: 'Books purchased successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error purchasing books', error: error.message });
    }
}



async function updateQuantity(req, res) {
    const { bookId, quantity } = req.body;
    const { userId } = req.cookies

    try {
        const user = await User.findById(userId);
        const cartItem = user.booksInCart.find(item => item.book.toString() === bookId);
        if (cartItem) {
            cartItem.quantity = quantity;
            await user.save();
            res.status(200).json({ message: 'Cart updated successfully' });
        } else {
            res.status(404).json({ message: 'Book not found in cart' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
}





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



module.exports = {
    updateQuantity,
    authenticateToken,
    buyBook,getBooks,getBookById,
    addReview,
    addToCart,
    removeFromCart,
    getCart, checkout
};