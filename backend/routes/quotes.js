
const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const authenticateToken = require('../middleware/auth');

// Get all quotes (for logged in user)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const quotes = await Quote.find({userId: req.user.id})
        .sort({createdAt: -1 })
        .limit(5); // Limit to 5 quotes per requirements

        res.json(quotes);
    } catch(error){
        res.status(500).json({
            message: 'Error fetching quotes',
            error: error.message
        });
    }
});

// Get sigle quote by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const quote = await Quote.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if(!quote){
            return res.status(404).json({message: 'Quote not found'});
        }
        res.json(quote);
    }catch(error){
        res.status(500).json({
            message: 'Error fetching quotes',
            error: error.message
        });
    }
});

// Post: create new quote
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {text, author} = req.body;

        // check if user already has 5 quotes
        const quoteCount = await Quote.countDocuments({userId: req.user.id});

        if(quoteCount >= 5){
            return res.status(400).json({
                message: 'You can only have 5 quotes. Please delete one to add n new quote'
            });
        }

        const quote = new Quote({
            text,
            author,
            userId: req.user.id
        });

        await quote.save();

        res.status(201).json({
            message: 'Quote created successfully'
        });
    } catch(error){
        res.status(500).json({
            message: 'Error creating quote',
            error: error.message
        });
    }
});

// Put: update quote
router.put('/:id', authenticateToken, async (req, res) => {
    try {

        const {text, author} = req.body;
        const quote = await Quote.findOneAndUpdate(
            {_id: req.params.id, userId: req.user.id},
            {text, author},
            {new: true, runValidators: true}
        );

        if(!quote){
            return res.status(404).json({
                message: 'quote not found'
            });
        }

        res.json({
            message: 'Quote updated successfully',
            quote
        });

    } catch(error){
        res.status(500).json({
            message: 'Error uodating Quote',
            error: error.message
        });
    }
});

// Delete quote
router.delete('/:id', authenticateToken,  async (req, res) => {
    try {
        const quote = await Quote.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if(!quote){
            res.status(404).json({
                message: 'Quote not found'
            });
        }

        res.json({message: 'Quote deleted successfully'});
    } catch (error){
        res.status(500).json({
            message: 'Error deleting quote',
            error: error.message
        });
    }
});

module.exports = router;