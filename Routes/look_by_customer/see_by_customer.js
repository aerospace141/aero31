const express = require('express');
// const Customer = require('../../models/Customer');
const { authenticateUser }  = require('../../middleware/authentication');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'authkey';



// Endpoint to generate JWT
router.post('/generate-access', authenticateUser, (req, res) => {
    try {
    const { adderPhoneNumber, adderuserId } = req.body;
    const myphone = req.ByPhoneNumber;

    // console.log('Data being sent:', { adderPhoneNumber: ByPhoneNumber, adderuserId });
    // // Validate required fields
    // if (!adderPhoneNumber || !adderuserId) {
    //   return res.status(400).json({ message: 'Adder phone number and user ID are required' });
    // }
  
    // Create JWT payload 
    const payload = {
      adderuserId,
      adderPhoneNumber,
      myphone,
    };
  
    // Sign the token with expiration time
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  
    // Respond with the token
    res.status(200).json({ token });
} catch (error) {
    res.status(500).json({ error: error.message || 'generate-access in backend' });
  }
  });
  
  // Verify token endpoint (optional for debugging)
  router.get('/verify-token', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.status(200).json({ valid: true, data: decoded });
    } catch (error) {
      res.status(401).json({ valid: false, message: 'Invalid or expired token' });
    }
  });
  
module.exports = router;
