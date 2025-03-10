const express = require('express');
const Customer = require('../../models/Customer');
const { authenticateUser }  = require('../../middleware/authentication');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Function to generate a random color
const generateRandomColor = () => {
  const colors = ["FF5733", "33FF57", "3357FF", "FF33A8", "FFBB33", "8E44AD", "2E86C1"];
  return colors[Math.floor(Math.random() * colors.length)];
};


// Add Customer
router.post('/addCustomer', authenticateUser, async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;

    // Validate required fields
    if (!name || !phoneNumber) {
      return res.status(400).json({ error: 'All fields are required: customerID, name, phoneNumber' });
    }
     // Extract first letter and assign a random color
     const firstLetter = name.charAt(0).toUpperCase();
     const bgColor = generateRandomColor();
 
     // Generate avatar URL using `ui-avatars.com`
     const profileImage = `https://ui-avatars.com/api/?name=${firstLetter}&background=${bgColor}&color=ffffff&size=128&bold=true`;
 

    const customer = new Customer({
      customerID: uuidv4(),
      name,
      phoneNumber,
      ByPhoneNumber: req.ByPhoneNumber,
      userId: req.userId,
      profileImage,

    });

    // Save customer to the database
    await customer.save();

    // Send success response
    res.status(201).json({
      message: 'Customer added successfully',
      customerID: customer.customerID || customer._id, // Use custom ID if available
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to add customer' });
  }
});

// Get all customers for a user

// router.get('/', authenticateUser, async (req, res) => {
//   try {
//     const customers = await Customer.find({ userId: req.userId });
//     res.json(customers);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch customers' });
//   }
// });

module.exports = router;
