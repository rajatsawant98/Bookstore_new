const Author = require('../Models/author');
const User = require('../Models/user');
const Admin = require('../Models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../Models/blacklist');
const roleConfig = require('../routes/roleConfig');


const JWT_SECRET = 'cldsjvndafkjvjh^%$%#kjbkjkl98787'
const JWT_REFRESH_SECRET = 'dfkjvbkd874^%HJKBKJKkjhvjhbkj865KHB&^%^*'


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
    console.log("userLogin getting called");
    const { username, password } = req.body;
    const user = await User.findOne({ username }).lean();

    if (!user) {
        return res.status(400).json({ message: 'Invalid username/password' });
    }

    if (await bcrypt.compare(password, user.password)) {
        const accessToken = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '15m' } // Access token expiration time
        );

        const refreshToken = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_REFRESH_SECRET,
            { expiresIn: '7d' } // Refresh token expiration time
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: 'strict'
        });

        return res.status(201).json({ message: 'User Login successfully', accessToken });
    } else {
        return res.status(400).json({ message: 'Invalid username/password' });
    }
}

async function logout(req, res) {
    try {
        console.log("Logout Getting called");
        const refreshToken = req.cookies.refreshToken;
        const accessToken = req.headers['authorization']?.split(' ')[1];

        if (!refreshToken || !accessToken) {
            return res.status(400).json({ message: 'No tokens provided' });
        }

        // Decode tokens to get their expiration times
        const decodedRefreshToken = jwt.decode(refreshToken);
        const decodedAccessToken = jwt.decode(accessToken);

        // Check if decoding was successful and exp field exists
        if (!decodedRefreshToken || !decodedRefreshToken.exp) {
            return res.status(400).json({ message: 'Invalid refresh token' });
        }

        if (!decodedAccessToken || !decodedAccessToken.exp) {
            return res.status(400).json({ message: 'Invalid access token' });
        }

        // Add tokens to blacklist
        await TokenBlacklist.create({
            token: refreshToken,
            expiresAt: new Date(decodedRefreshToken.exp * 1000)
        });

        await TokenBlacklist.create({
            token: accessToken,
            expiresAt: new Date(decodedAccessToken.exp * 1000)
        });

        // Clear cookies
        res.clearCookie('refreshToken');
        res.clearCookie('userId');

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function authorLogout(req, res) {
    try {
        console.log("Logout Getting called");
        const refreshToken = req.cookies.refreshToken;
        // console.log("RefresToken :", refreshToken);
        const accessToken = req.headers['authorization']?.split(' ')[1];
        // console.log("accessToken :", accessToken);


        if (!refreshToken || !accessToken) {
            return res.status(400).json({ message: 'No tokens provided' });
        }

        console.log("Here 1");

        // Decode tokens to get their expiration times
        const decodedRefreshToken = jwt.decode(refreshToken);
        const decodedAccessToken = jwt.decode(accessToken);

        console.log("Here 2");

        // Add tokens to blacklist
        await TokenBlacklist.create({ token: refreshToken, expiresAt: new Date(decodedRefreshToken.exp * 1000) });
        await TokenBlacklist.create({ token: accessToken, expiresAt: new Date(decodedAccessToken.exp * 1000) });

        console.log("Here 3");

        // Clear cookies
        res.clearCookie('refreshToken');
        res.clearCookie('authorId');

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


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
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ accessToken });
    });
}




async function authenticateToken(req, res, next) {
    console.log("authenticateToken getting called");
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Check if token is blacklisted
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
        return res.status(403).json({ message: 'Token in blacklist. Invalid token.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }

        req.user = user;

        const path = req.originalUrl; // Get the path of the current route
        console.log("Path:", path);
        const allowedRoles = roleConfig[path]; // Get the allowed roles for this path from the config
        console.log("allowedRoles:", allowedRoles);

        if (!allowedRoles || !allowedRoles.includes(req.user.role)) {
            console.log("User not authorized");
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
        console.log("Authentication and Authorization Complete");
        next();
    });
}




async function authorLogin(req, res) {
    const { author_name, password } = req.body;
    const author = await Author.findOne({ author_name });

    if (!author) {
        return res.status(400).json({ message: 'Invalid username/password' });
    }

    if (await bcrypt.compare(password, author.password)) {
        const accessToken = jwt.sign(
            { id: author._id, author_name: author.author_name, role: author.role },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: author._id, author_name: author.author_name, role: author.role },
            JWT_REFRESH_SECRET,
            { expiresIn: '7d' } // Refresh token expiration time
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: 'strict'
        });

        return res.status(201).json({ message: 'Author Login successfully', accessToken });

    } else {
        return res.status(500).json({ message: 'Invalid Username/Password' });
    }
}

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
                { id: admin._id, username: admin.username, role: admin.role },
                JWT_SECRET,
                { expiresIn: '15m' } // Access token expiration time
            );

            const refreshToken = jwt.sign(
                { id: admin._id, username: admin.username, role: admin.role },
                JWT_REFRESH_SECRET,
                { expiresIn: '7d' } // Refresh token expiration time
            );

            res.cookie('refreshToken', refreshToken, {
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


module.exports = {
    registerUser, userLogin, logout, refreshToken, authenticateToken, authorLogin, adminLogin, authorLogout
}