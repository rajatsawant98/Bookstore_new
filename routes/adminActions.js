const express = require('express')
const router = express.Router()
const upload = require('../uploads/upload');

const { addBook, editStock, deleteBook, deleteUser, addAdmin, addAuthor, deleteAuthor, authorize} = require('../controllers/adminControllers');

const {authenticateToken} = require('../controllers/loginControllers');

router.post('/addBook', authenticateToken,authorize(['SuperAdmin', 'Bookkeeper']) ,upload.single('bookPhoto'), addBook);

router.post('/editStock', authenticateToken,authorize(['SuperAdmin', 'Bookkeeper']), editStock);

router.delete('/deleteBook',authenticateToken,authorize(['SuperAdmin', 'Bookkeeper']),  deleteBook);

router.delete('/deleteUser',authenticateToken , authorize(['SuperAdmin', 'Librarian']) ,deleteUser);

router.post('/admin', authenticateToken , authorize(['SuperAdmin']) ,addAdmin);

router.post('/addAuthor', authenticateToken , authorize(['SuperAdmin', 'Librarian']), addAuthor);

router.delete('/deleteAuthor',authenticateToken , authorize(['SuperAdmin', 'Librarian']),  deleteAuthor);


module.exports = router
