const express = require('express');
const router = express.Router();
const User = require('../../models/user'); // Assuming your User model is defined in this file
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'anykey';
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client("679832363574-9don8skic3d6n3r8geli6ippcbrip1pe.apps.googleusercontent.com"); // paste your Client ID


router.post('/login', async (req, res) => {
    try {
      // Extract email and password from request body
      const { mobileNumber, password } = req.body;
  
      // Check if user with the provided email exists
      const user = await User.findOne({ mobileNumber });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // If passwords match, generate JWT token
      const token = jwt.sign({userId: user.userId, mobileNumber: user.mobileNumber}, jwtSecret, { expiresIn: '1h' });
  
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Error during login' });
    }
  });
    // Google authentication route
router.post('/auth/google', async (req, res) => {
  try {
    const { token, mobileNumber } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    if (!mobileNumber) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "679832363574-9don8skic3d6n3r8geli6ippcbrip1pe.apps.googleusercontent.com", // from Google Cloud Console
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists with the provided mobile number
    let user = await User.findOne({ mobileNumber });

    if (user) {
      // User exists, update Google information
      user.email = email;
      // user.name = name || user.name;
      // user.profilePicture = picture || user.profilePicture;
      // user.googleId = payload.sub;
      await user.save();
    } else {
      // Create new user with Google information and provided mobile number
      const salt = await bcrypt.genSalt(10);
      // Generate a random password (user will login with Google or can reset password)
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        firstName: name,
        email: email,
        mobileNumber: mobileNumber,
        password: hashedPassword,
        // googleId: payload.sub,
        // profilePicture: picture,
        // Additional fields as needed
      });

      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user.userId, mobileNumber: user.mobileNumber },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token: jwtToken });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});


  module.exports = router;