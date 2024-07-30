const express = require('express')
const cookieParser = require('cookie-parser');
const router = express.Router()

const {registerUser,getAllUsers,buyBook,addReview, userLogin, addAdmin, adminLogin, deleteUser, addToCart, removeFromCart} = require('./userControllers');

router.post('/register', registerUser);

router.post('/login', userLogin);

router.get('/' , getAllUsers);

router.post('/buy', buyBook);

router.post('/review', addReview);

router.delete('/deleteUser', deleteUser);

router.post('/admin', addAdmin)

router.post('/adminLogin', adminLogin)

router.post('/add-to-cart', addToCart)

router.post('/remove-from-cart', removeFromCart)

router.post('/logout', (req, res) => {
    res.clearCookie('userId');
    res.json({ message: 'Logged out successfully' });
});


module.exports = router