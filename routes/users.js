const express = require('express')
const cookieParser = require('cookie-parser');
const router = express.Router()

const {registerUser,getAllUsers,buyBook,addReview, userLogin, addAdmin,updateQuantity, refreshToken,
    adminLogin, deleteUser, addToCart, removeFromCart,getCart, checkout, logout, authenticateToken} = require('./userControllers');

router.post('/register', registerUser);

router.post('/login', userLogin);

router.post('/users/verify-token', authenticateToken, (req, res) => {
    res.json({ valid: true });
});

router.post('/refresh-token', refreshToken)

router.get('/' , getAllUsers);

router.post('/buy', authenticateToken, buyBook);

router.post('/review', addReview);

router.delete('/deleteUser', deleteUser);

router.post('/admin', addAdmin)

router.post('/adminLogin', adminLogin)

router.post('/add-to-cart', authenticateToken, addToCart)

router.post('/remove-from-cart', removeFromCart)

router.get('/cart',authenticateToken , getCart)

router.post('/checkout', checkout)

router.post('/update-quantity', updateQuantity)

router.post('/logout', logout)



// router.post('/logout', (req, res) => {
//     res.clearCookie('userId');
//     res.json({ message: 'Logged out successfully' });
// });


module.exports = router