const express = require('express')
const router = express.Router()

const {buyBook,addReview, updateQuantity, 
     addToCart, removeFromCart,getCart, checkout,getBookById, getBooks} = require('../controllers/userControllers');
const {authenticateToken} = require('../controllers/loginControllers');

router.get('/all', authenticateToken, getBooks);

router.post('/book', authenticateToken, getBookById);

router.post('/buy', authenticateToken, buyBook);

router.post('/review', authenticateToken,addReview);

router.post('/add-to-cart', authenticateToken, addToCart);

router.post('/remove-from-cart', authenticateToken,removeFromCart);

router.get('/cart',authenticateToken , getCart);

router.post('/checkout', authenticateToken,checkout);

router.post('/update-quantity',authenticateToken , updateQuantity);

module.exports = router;