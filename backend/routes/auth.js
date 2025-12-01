
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


router.post('/register', async (req, res) =>{
    try {
        const {username, email, password} = req.body;

        // check if user already exists 
        const existingUser = await User.findOne({
            $or: [{username}, {email}]
        });

        if(existingUser){
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // hash a password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create a new user
        const user = new User({ 
            username,
            email,
            password: hashedPassword
    });

        await user.save()
        res.status(201).json({
            message: "User registered successfully"
        });

    }catch(error){
        res.status(500).json({
            message: "Error registering user",
            error: error.message
        });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try{
        const {username, password} = req.body;

        // find user
        const user = await User.findOne({username});
        
        if(!user) {
            return res.status(401).json({message: 'Invalid credentials'});
        }

        // check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(401).json({message: 'Invalid credentials'});
        }

        // create a JWT token
        const token = jwt.sign(
            {id: user._id, username: user.username},
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        );
        res.json({
            message: 'Login successful',
            token,
            username: user.username
        });

    }catch(error){
        res.status(500).json({
            message: 'Error login in',
            error: error.message
        });
    }
});

module.exports = router;