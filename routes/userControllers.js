const Author = require('../Models/author');
const Book = require('../models/bookSchema');
const User = require('../Models/user');
const Admin = require('../Models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


const JWT_SECRET = 'cldsjvndafkjvjh^%$%#kjbkjkl98787'


function adminAuth(req, res, next) {
    if (req.query.actor === "admin") {
        next();
    } else {
        res.send("Not Authorized");
    }
}

function authorAuth(req, res, next) {
    if (req.query.actor === "author") {
        next();
    } else {
        res.send("Not Authorized");
    }
}

function eitherAuth(req, res, next) {
    if (req.query.actor === "author" || req.query.actor === "admin") {
        next();
    } else {
        res.send("Not Authorized");
    }
}


async function addAdmin(req, res) {
    try {
        const { username, email, password, age, address, gender } = req.body;

        // Validate required fields
        if (!username || !email || !password || !age || !address || !gender) {
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
            gender
        });

        // Save the admin to the database
        await newAdmin.save();

        res.status(201).json({ message: 'Admin added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error adding admin', error: err.message });
    }
}




async function registerUser(req, res) {
    try {
        const { username, email, age, address, gender, password: plainTextPassword } = req.body;

        console.log("Username : ", username);

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ message: 'Invalid username' });
        }
        

        if (!plainTextPassword || typeof plainTextPassword !== 'string') {
            return res.status(400).json({ message: 'Invalid password' });
        }
        
        if (plainTextPassword.length < 6) {
            return res.status(400).json({ message: 'Password too small. Should be at least 6 characters' });
        }
        

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        

        // Hash the password
        const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

        

        // Create a new user
        const user = new User({
            username,
            email,
            age,
            address,
            gender,
            password: hashedPassword
        });

        
        await user.save().catch(err => {
            console.error("Error saving user:", err);
            throw err; // Rethrow the error to be caught in the catch block
        });
        
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
}


async function userLogin(req, res) {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).lean();

    if (!user) {
        return res.status(400).json({ message: 'Invalid username/password' });
    }

    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET
        );

        res.cookie('userId', user._id.toString(), {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: 'strict'
        });
        console.log('Setting cookie: userId', user._id.toString());
        return res.status(201).json({ message: 'User Login successfully', data: token });
        
    } else {
        return res.status(400).json({ message: 'Invalid username/password' });
    }
}


async function adminLogin(req, res) {
    const { username, password } = req.body;
    console.log('Login attempt:', username); // Log the login attempt

    try {
        const admin = await Admin.findOne({ username }).lean();

        if (!admin) {
            console.log('Admin not found'); // Log when admin is not found
            return res.status(400).json({ message: 'Invalid username/password' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        console.log('Password comparison result:', isPasswordCorrect); // Log the result of password comparison

        if (isPasswordCorrect) {
            const token = jwt.sign(
                {
                    id: admin._id,
                    username: admin.username
                },
                JWT_SECRET
            );

            console.log('Login successful'); // Log successful login
            res.status(201).json({ message: 'Admin Login successfully' });
        }else{
            console.log('Incorrect password'); // Log when the password is incorrect
            return res.status(400).json({ message: 'Invalid username/password' });
        }
        

        
    } catch (err) {
        console.error('Error during login:', err); // Log any errors that occur during login
        res.status(500).json({ status: 'error', error: 'An error occurred during login. Please try again.' });
    }
}





async function getAllUsers(req, res) {
    try {
        const users = await User.find().populate('books', 'book_name');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving users', error: err.message });
    }
}



async function buyBook(req, res) {
    try {
        console.log('Cookies:', req.cookies);
        const { bookId } = req.body;
        console.log('bookId from body:', bookId);
        const { userId } = req.cookies
        console.log('userId from cookies:', userId);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const book = await Book.findById(bookId);
        
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        else if(book.countInStock <= 0){
            return res.status(404).json({ message: 'Book out of stock' });
        }
        else{
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

async function addToCart(req, res){
    const { bookId } = req.body;
    const { userId } = req.cookies
    console.log('userId from cookies:', userId);

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the book is already in the cart
        const isBookInCart = user.booksInCart.some(cartItem => cartItem.book.equals(bookId));

        if (isBookInCart) {
            return res.status(400).json({ message: 'Book already in cart' });
        }else{
            user.booksInCart.push({ book: bookId , quantity : 1});
            await user.save();

            res.status(200).json({ message: 'Book added to cart' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred. Please try again.', error: error.message });
    }
}


async function removeFromCart(req, res){
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
        }else{
            user.booksInCart.splice(cartIndex, 1);
            await user.save();

            res.status(200).json({ message: 'Book removed from cart' });
        }

        
    } catch (error) {
        res.status(500).json({ message: 'An error occurred. Please try again.', error: error.message });
    }
}


async function getCart(req, res) {
    const { userId } = req.cookies

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
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ booksInCart: user.booksInCart });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred. Please try again.', error: error.message });
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

async function updateQuantity(req, res){
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

async function logout(req, res) {
    res.clearCookie('userId', {
        httpOnly: true,
        secure: false, // Set to true if using HTTPS
        sameSite: 'strict'
    });
    res.status(200).json({ message: 'Logged out successfully.' });
}

module.exports = {
    adminAuth,updateQuantity, 
    authorAuth,
    eitherAuth,
    registerUser,
    getAllUsers,
    buyBook,
    addReview,
    userLogin,
    addAdmin,
    adminLogin,
    deleteUser,
    addToCart,
    removeFromCart,
    getCart,checkout, logout
};