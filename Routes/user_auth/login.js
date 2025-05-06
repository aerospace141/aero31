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
// Google authentication route
router.post('/auth/google', async (req, res) => {
  try {
    console.log("Google auth request received:", req.body);
    const { token, mobileNumber } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    if (!mobileNumber) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Verify the Google token
    console.log("Verifying token with client ID:", GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "679832363574-9don8skic3d6n3r8geli6ippcbrip1pe.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    console.log("Google payload received:", payload);
    const { email, name, sub } = payload;

    // Check if user exists with the provided mobile number
    let user = await User.findOne({ mobileNumber });

    if (user) {
      console.log("User found with mobile number:", mobileNumber);
      // User exists, update Google information
      user.email = email || user.email;
      
      // Handle potential missing fields in user model
      try {
        await user.save();
        console.log("Updated existing user");
      } catch (saveError) {
        console.error("Error saving user:", saveError);
        return res.status(500).json({ error: 'Error updating user profile' });
      }
    } else {
      console.log("Creating new user for mobile:", mobileNumber);
      // Create new user with Google information and provided mobile number
      try {
        // Generate random password for new user
        const randomPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);
        
        // Generate a unique userId (you might have a different way to generate this)
        const userId = 'G' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 5);
        
        // Split name into first and last name
        let firstName = name;
        let lastName = "";
        
        if (name && name.includes(' ')) {
          const nameParts = name.split(' ');
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        }

        user = new User({
          userId: userId,
          firstName: firstName,
          lastName: lastName || ".", // Your schema requires lastName
          email: email,
          mobileNumber: mobileNumber,
          password: hashedPassword
        });

        await user.save();
        console.log("New user created successfully");
      } catch (createError) {
        console.error("Error creating new user:", createError);
        return res.status(500).json({ error: 'Failed to create new user account' });
      }
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user.userId, mobileNumber: user.mobileNumber },
      jwtSecret,
      { expiresIn: '1h' }
    );

    console.log("Authentication successful, returning token");
    res.status(200).json({ token: jwtToken });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ error: 'Authentication failed: ' + error.message });
  }
});

module.exports = router;