const express = require('express')
const router = express.Router()

const {buyBook,addReview, updateQuantity, getBookById,
     addToCart, removeFromCart,getCart, checkout,  authenticateToken, getBooks} = require('../controllers/userControllers');


router.get('/all', getBooks);

router.get('/book/:id', getBookById);

router.post('/buy', authenticateToken, buyBook);

router.post('/review', addReview);

router.post('/add-to-cart', authenticateToken, addToCart)

router.post('/remove-from-cart', removeFromCart)

router.get('/cart',authenticateToken , getCart)

router.post('/checkout', checkout)

router.post('/update-quantity', updateQuantity)



module.exports = router