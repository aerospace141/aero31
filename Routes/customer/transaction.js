const express = require('express');
const Transaction = require('../../models/Transaction');
const Customer = require('../../models/Customer');
const { authenticateUser } = require('../../middleware/authentication');
const router = express.Router();

// Add a new transaction
router.post('/transactions',authenticateUser, async (req, res) => {
  const { customerID, transactionType, amount, receiver } = req.body;

  try {
    const customer = await Customer.findOne({customerID:customerID});
    if (!customer || customer.userId.toString() !== req.userId) {
      return res.status(404).json({ error: 'Customer not found or unauthorized' });
    }

    const transaction = new Transaction({
      sender: req.ByPhoneNumber,
      receiver,
      customerID,
      transactionType,
      amount,
    });
    await transaction.save();

    res.status(201).json({ message: 'Transaction added successfully', transaction });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// Get transactions for a customer
router.get('/transactions/:customerID', authenticateUser, async (req, res) => { 
  const { customerID } = req.params; 
  try { 
    const customer = await Customer.findOne({customerID:customerID}); 
  if (!customer || customer.userId.toString() !== req.userId) { 
    return res.status(404).json({ error: 'Customer not found or unauthorized' }); 
  } 
    const transactions = await Transaction.find({customerID:customerID});
    res.json(transactions); 
  } 
    catch (error) { console.error('Fetch transactions error:', error); 
      res.status(500).json({ error: 'Failed to fetch transactions' }); 
    } });

router.get('/customers/:customerID', authenticateUser, async(req, res) => {
  const { customerID } = req.params; // Extract customerID from the route
  // const customer = customer.find((c) => c.customerID === customerID);
  const customer = await Customer.findOne({customerID:customerID});
  // findOne({id: id});
if (!customer || customer.userId.toString() !== req.userId) {
  return res.status(404).json({ error: 'Customer not found or unauthorized' });
}

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' }); // Respond with 404 if not found
  }

  res.json(customer); // Respond with the customer details
});

module.exports = router;
