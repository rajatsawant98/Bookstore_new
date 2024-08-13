const express = require('express')
const router = express.Router()

const {buyBook,addReview, updateQuantity, 
     addToCart, removeFromCart,getCart, checkout, getBooks} = require('../controllers/userControllers');
const {authenticateToken} = require('../controllers/loginControllers')


// router.get('/all', getBooks);

router.post('/buy', authenticateToken, buyBook);

router.post('/review', authenticateToken,addReview);

router.post('/add-to-cart', authenticateToken, addToCart)

router.post('/remove-from-cart', authenticateToken,removeFromCart)

router.get('/cart',authenticateToken , getCart)

router.post('/checkout', authenticateToken,checkout)

router.post('/update-quantity',authenticateToken , updateQuantity)


module.exports = router