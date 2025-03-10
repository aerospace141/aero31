const express = require('express');
const router = express.Router();
const { authenticateUser }  = require('../../middleware/authentication');
const User = require('../../models/user');

router.get('/user-profile', authenticateUser, async (req, res) => {
    const userId = req.userId  
      
    try {
      const user = await User.findOne({userId: userId});
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  module.exports = router;