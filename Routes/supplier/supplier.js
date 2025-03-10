const express = require('express');
const Supplier = require('../../models/Supplier');
const { authenticateUser }  = require('../../middleware/authentication');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Add Customer
router.post('/addSupplier', authenticateUser, async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;

    // Validate required fields
    if (!name || !phoneNumber) {
      return res.status(400).json({ error: 'All fields are required: customerID, name, phoneNumber' });
    }

    const supplier = new Supplier({
      supplierID: uuidv4(),
      name,
      phoneNumber,
      ByPhoneNumber: req.ByPhoneNumber,
      userId: req.userId,
    });

    // Save customer to the database
    await supplier.save();

    // Send success response
    res.status(201).json({
      message: 'Customer added successfully',
      supplierID: supplier.supplierID, // Use custom ID if available
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to add customer' });
  }
});

module.exports = router;
