
const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Quote text is required'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'quote author is required'],
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Quote', quoteSchema);