const Author = require('../Models/author');
const Book = require('../models/bookSchema');
const User = require('../Models/user');

function adminAuth(req, res, next) {
    if (req.query.actor === "admin") {
        next();
    } else {
        res.send("Not Authorized");
    }
}

function authorAuth(req, res, next) {
    if (req.query.actor === "author") {
        next();
    } else {
        res.send("Not Authorized");
    }
}

function eitherAuth(req, res, next) {
    if (req.query.actor === "author" || req.query.actor === "admin") {
        next();
    } else {
        res.send("Not Authorized");
    }
}

async function getAllAuthors(req, res) {
    try{  
            const author = await Author.find()
            res.json(author)
    }catch(err){
        res.status(500).json({ message: 'Error', error: err.message });
    }
}


async function addAuthor(req, res) {
    const author = new Author({
        author_name : req.body.author_name,
        age : req.body.age,
        address : req.body.address,
        gender : req.body.gender
    })

    try{
        const a1 = await author.save()
        res.json(a1)
    }catch(err){
        res.status(500).json({ message: 'Error', error: err.message });
    }
}


async function deleteAuthor(req, res) {
    try {
        const { author_name } = req.body;

        if (!author_name) {
            return res.status(400).json({ message: 'Author name is required' });
        }

        const author = await Author.findOne({ author_name: author_name });

        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }

        // Delete all books related to this author
        const deleteBooksResult = await Book.deleteMany({ author: author._id });
        
        // Delete the author
        const deleteAuthorResult = await author.deleteOne();
        
        return res.status(200).json({
            message: 'Author and related books deleted successfully',
            authorResult: deleteAuthorResult,
            booksDeleted: deleteBooksResult.deletedCount
        });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting author and related books', error: err.message });
    }
}




module.exports = {
    adminAuth,
    authorAuth,
    eitherAuth,
    getAllAuthors,
    addAuthor,
    deleteAuthor
};
