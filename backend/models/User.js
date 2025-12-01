
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is reqquired'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 charcter']
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid emial']
    },
    password: {
        type: String,
        required: [true, 'password is reuired'],
        minlength: [6, 'password must be at least 6 characters long']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);