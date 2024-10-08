const express = require('express')
const router = express.Router()
const upload = require('../upload');

const { addBook, editStock, deleteBook, deleteUser, addAdmin, addAuthor, deleteAuthor} = require('../controllers/adminControllers');

const {authenticateToken} = require('../controllers/loginControllers');

router.post('/addBook', authenticateToken, upload.fields([
    { name: 'bookPhotos', maxCount: 5 },
    { name: 'billPhotos', maxCount: 5 },
    { name: 'previewPhotos', maxCount: 5 }
]), addBook);


router.post('/editStock', authenticateToken, editStock);

router.delete('/deleteBook', authenticateToken, deleteBook);

router.delete('/deleteUser', authenticateToken, deleteUser);

router.post('/admin', authenticateToken, addAdmin);

router.post('/addAuthor', authenticateToken, addAuthor);

router.delete('/deleteAuthor', authenticateToken, deleteAuthor);


module.exports = router
