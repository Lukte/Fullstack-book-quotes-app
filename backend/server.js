// import required packeges
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const quoteRoutes = require('./routes/quotes');

// initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors({
    origin: [
        'http://localhost:4200',
        'https://fullstack-book-quotes-app-luktes-projects.vercel.app' 
    ],
    credentials: true
}));
app.use(express.json());


// Routes 
app.get('/', (req, res) => {
    res.json({message: "Welcome to Book and Quotes API!"});
});


app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/quotes', quoteRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('Connected to MongoDB successfully!');

    // start server only after detabase connection
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
.catch((error)=> {
    console.log('MongoDB connection error', error);
});
