const jwt = require('jsonwebtoken');
const { User } = require('../models/user'); // Assuming you have a User model
const JWT_SECRET = process.env.JWT_SECRET || 'authkey';
const limited_auth = async (req, res, next) => {
  const token = req.header('limited_auth');

  if (!token) {
    return res.status(401).json({ error: 'Authorization denied. No token provided.' });
  }

  try {
    const decoded = jwt.decode(token);
    // const user = await User.findOne({ id: decoded });

    // if (!user) {
    //   return res.status(401).json({ error: 'User not found.' });
    // }

    req.userId = decoded.adderuserId;
    req.myphone =  decoded.myphone;
    req.adderPhoneNumber = decoded.adderPhoneNumber;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Token is not valid.' });
  }
};

module.exports = { limited_auth };