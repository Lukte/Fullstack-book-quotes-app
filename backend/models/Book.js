
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true
    },

    author: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true
    },

    publicationDate: {
        type: Date,
        required: [true, 'Publication data is required']
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', bookSchema);