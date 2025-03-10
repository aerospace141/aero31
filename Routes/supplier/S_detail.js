const express = require('express');
const Customer = require('../../models/Customer');
const { authenticateUser }  = require('../../middleware/authentication');
const Supplier = require('../../models/Supplier');
const router = express.Router();

router.get('/supplier', authenticateUser,  async (req, res) => {
  const byPhoneNumber = req.ByPhoneNumber;

  try {
    const supplier = await Supplier.find({ ByPhoneNumber: byPhoneNumber });
      // .sort({ createdAt: -1 });
      res.status(200).json(supplier);
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
  }
});

module.exports = router;
