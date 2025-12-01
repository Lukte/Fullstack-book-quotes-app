
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const authenticateToken = require('../middleware/auth');

// get all books (for logged in user)
router.get('/', authenticateToken, async (req, res) =>{
    try {
        const books = await Book.find({userId: req.user.id})
        .sort({createdAt: -1}); // Newest first
        
        res.json(books);
    }catch(error){
        res.status(500).json({
            message: 'Error fetching books',
            error: error.message
        });
    }
});

// get single book by id
router.get('/:id', authenticateToken, async(req, res) =>{
    try {
        const book = await Book.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if(!book){
            return res.status(404).json({message: 'book not found'});
        }
        res.json(book);

    }catch(error){
        res.status(500).json({
            message: 'Error fetching book',
            error: error.message
        });
    }
});

// Post Create new book
router.post('/', authenticateToken, async (req, res) =>{
    try {
        const {title, author, publicationDate } = req.body;

        const book = new Book({
            title,
            author,
            publicationDate,
            userId: req.user.id
        });

        await book.save();

        res.status(201).json({
            message: 'Book created successfully',
            book
        });
    }catch(error){
        res.status(500).json({
            message: 'Error crearting book',
            error: error.message
        });
    }
});

// Put: update an existing book
router.put('/:id', authenticateToken, async(req, res) => {
    try {
        const {title, author, publicationDate} = req.body;

        const book = await Book.findOneAndUpdate(
            {_id: req.params.id, userId: req.user.id },
            {title, author, publicationDate },
            {new: true, runValidators: true } // return updated book
        );

        if(!book){
            return res.status(404).json({message: 'book was not found'});
        }

        res.json({
            message: 'book updated successfully',
            book
        });
    } catch(error){
        res.status(500).json({
            message: 'Error updating book',
            error: error.message
        });
    }
});

// Delete: deleting a book
router.delete('/:id', authenticateToken, async(req, res) => {
    try {

        const book = await Book.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if(!book){
            return res.status(404).json({message: 'book not found'});
        }

        res.json({message: 'book successfully deleted'});
    }catch(error){
        res.status(500).json({
            message: 'Error deleting book',
            error: error.message
        });
    }
});

module.exports = router;

