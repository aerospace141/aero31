const express = require('express');
const router = express.Router();
const User = require('../../models/user'); // Assuming your User model is defined in this file
const bcrypt = require('bcrypt');
// const { authenticateUser } = require('../middleware/authentication');

router.post('/signup', async (req, res) => {
    try {
      // Extract user details from request body
      const { firstName, lastName, email, mobileNumber, password, userId } = req.body;
  
      // Check if user with the same email already exists
      const existingUser = await User.findOne({ mobileNumber });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this MobileNumber already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new user
      const newUser = new User({
        firstName,
        lastName,
        email,
        mobileNumber,
        password: hashedPassword,
        userId,
      });
  
      // Save the user to the database
      await newUser.save();
  
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({ error: `Duplicate value for field: ${field}` });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal Server Error', message: 'Whole server is not taking off!' });
    }
  });
  
module.exports = router;