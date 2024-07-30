const express = require('express')
const router = express.Router()

const {adminAuth, authorAuth,eitherAuth,getAllAuthors,addAuthor, deleteAuthor} = require('./authControllers');

router.get('/', adminAuth,getAllAuthors);

router.post('/', adminAuth, addAuthor);

router.delete('/deleteAuthor', deleteAuthor);

module.exports = router