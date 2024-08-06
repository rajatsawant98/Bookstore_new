const Author = require('../Models/author');
const Book = require('../models/bookSchema');
const User = require('../Models/user');
const Admin = require('../Models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const TokenBlacklist = require('../Models/blacklist');



const JWT_SECRET = 'cldsjvndafkjvjh^%$%#kjbkjkl98787'
const JWT_REFRESH_SECRET = 'dfkjvbkd874^%HJKBKJKkjhvjhbkj865KHB&^%^*'

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


// async function userLogin(req, res) {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username }).lean();

//     if (!user) {
//         return res.status(400).json({ message: 'Invalid username/password' });
//     }

//     if (await bcrypt.compare(password, user.password)) {
//         const token = jwt.sign(
//             { id: user._id, username: user.username },
//             JWT_SECRET
//         );

//         res.cookie('userId', user._id.toString(), {
//             httpOnly: true,
//             secure: false, // Set to true if using HTTPS
//             sameSite: 'strict'
//         });
//         console.log('Setting cookie: userId', user._id.toString());
//         return res.status(201).json({ message: 'User Login successfully', data: token });

//     } else {
//         return res.status(400).json({ message: 'Invalid username/password' });
//     }
// }


async function userLogin(req, res) {
    console.log("userLogin getting called");
    const { username, password } = req.body;
    const user = await User.findOne({ username }).lean();

    if (!user) {
        return res.status(400).json({ message: 'Invalid username/password' });
    }

    if (await bcrypt.compare(password, user.password)) {
        const accessToken = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '15m' } // Access token expiration time
        );

        const refreshToken = jwt.sign(
            { id: user._id, username: user.username },
            JWT_REFRESH_SECRET,
            { expiresIn: '7d' } // Refresh token expiration time
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: 'strict'
        });

        res.cookie('userId', user._id.toString(), {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: 'strict'
        });

        return res.status(201).json({ message: 'User Login successfully', accessToken });
    } else {
        return res.status(400).json({ message: 'Invalid username/password' });
    }
}


// async function adminLogin(req, res) {
//     const { username, password } = req.body;
//     console.log('Login attempt:', username); // Log the login attempt

//     try {
//         const admin = await Admin.findOne({ username }).lean();

//         if (!admin) {
//             console.log('Admin not found'); // Log when admin is not found
//             return res.status(400).json({ message: 'Invalid username/password' });
//         }

//         const isPasswordCorrect = await bcrypt.compare(password, admin.password);
//         console.log('Password comparison result:', isPasswordCorrect); // Log the result of password comparison

//         if (isPasswordCorrect) {
//             const token = jwt.sign(
//                 {
//                     id: admin._id,
//                     username: admin.username
//                 },
//                 JWT_SECRET
//             );

//             console.log('Login successful'); // Log successful login
//             res.status(201).json({ message: 'Admin Login successfully' });
//         } else {
//             console.log('Incorrect password'); // Log when the password is incorrect
//             return res.status(400).json({ message: 'Invalid username/password' });
//         }



//     } catch (err) {
//         console.error('Error during login:', err); // Log any errors that occur during login
//         res.status(500).json({ status: 'error', error: 'An error occurred during login. Please try again.' });
//     }
// }


async function adminLogin(req, res) {
    console.log("adminLogin getting called");
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username }).lean();

        if (!admin) {
            console.log('Admin not found'); // Log when admin is not found
            return res.status(400).json({ message: 'Invalid username/password' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        console.log('Password comparison result:', isPasswordCorrect); // Log the result of password comparison

        if (isPasswordCorrect) {
            const accessToken = jwt.sign(
                { id: admin._id, username: admin.username, role:admin.role },
                JWT_SECRET,
                { expiresIn: '15m' } // Access token expiration time
            );

            const refreshToken = jwt.sign(
                { id: admin._id, username: admin.username, role:admin.role },
                JWT_REFRESH_SECRET,
                { expiresIn: '7d' } // Refresh token expiration time
            );

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false, // Set to true if using HTTPS
                sameSite: 'strict'
            });

            res.cookie('adminId', admin._id.toString(), {
                httpOnly: true,
                secure: false, // Set to true if using HTTPS
                sameSite: 'strict'
            });

            console.log('Login successful'); // Log successful login
            return res.status(201).json({ message: 'Admin Login successfully', accessToken });
        } else {
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
    }
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



// async function authenticateToken(req, res, next) {
//     console.log("authenticateToken getting called");
//     // console.log("Headers: ",req.headers);
//     const token = req.headers['authorization']?.split(' ')[1];
//     // console.log("Token from headers: ",token);
//     if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

//     jwt.verify(token, JWT_SECRET, (err, user) => {
//         if (err) return res.status(403).json({ message: 'Invalid token.' });

//         req.user = user;

//         // console.log("USER: ",user)
//         // console.log("REQ USER: ",req.user)
//         next();
//     });
// }


// async function authenticateToken(req, res, next) {
//     console.log("authenticateToken getting called");
//     const token = req.headers['authorization']?.split(' ')[1];

//     if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

//     // Check if token is blacklisted
//     const blacklistedToken = await TokenBlacklist.findOne({ token });
//     if (blacklistedToken) return res.status(403).json({ message: 'Token in blacklist. Invalid token.' });

//     jwt.verify(token, JWT_SECRET, (err, user) => {
//         if (err) return res.status(403).json({ message: 'Invalid token.' });

//         req.user = user;
//         next();
//     });
// }



async function refreshToken(req, res) {
    console.log("refreshToken getting called");
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json({ message: 'Access denied. No refresh token provided.' });

    // Check if token is blacklisted
    const blacklistedToken = await TokenBlacklist.findOne({ token: refreshToken });
    if (blacklistedToken) return res.status(403).json({ message: 'Token in blacklist. Invalid refresh token.' });

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid refresh token.' });

        const accessToken = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ accessToken });
    });
}




async function logout(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;
        const accessToken = req.headers['authorization']?.split(' ')[1];

        if (!refreshToken || !accessToken) {
            return res.status(400).json({ message: 'No tokens provided' });
        }

        // Decode tokens to get their expiration times
        const decodedRefreshToken = jwt.decode(refreshToken);
        const decodedAccessToken = jwt.decode(accessToken);

        // Add tokens to blacklist
        await TokenBlacklist.create({ token: refreshToken, expiresAt: new Date(decodedRefreshToken.exp * 1000) });
        await TokenBlacklist.create({ token: accessToken, expiresAt: new Date(decodedAccessToken.exp * 1000) });

        // Clear cookies
        res.clearCookie('refreshToken');
        res.clearCookie('userId');

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error logging out', error: error.message });
    }
}

module.exports = {
    updateQuantity, refreshToken,
    authenticateToken,authorize,
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
    getCart, checkout, logout
};