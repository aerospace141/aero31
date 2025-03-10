const express = require('express');
const Transaction = require('../../models/Transaction');
const Supplier = require('../../models/Supplier');
const { authenticateUser } = require('../../middleware/authentication');
const router = express.Router();

// Add a new transaction
router.post('/transactions',authenticateUser, async (req, res) => {
  const { supplierID, transactionType, amount, receiver } = req.body;

  try {
    const supplier = await Supplier.findOne({supplierID:supplierID});
    if (!supplier || supplier.userId.toString() !== req.userId) {
      return res.status(404).json({ error: 'Customer not found or unauthorized' });
    }

    const transaction = new Transaction({
      sender: req.ByPhoneNumber,
      receiver,
      supplierID,
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
router.get('/transactions_s/:supplierID', authenticateUser, async (req, res) => { 
  const { supplierID } = req.params; 
  try { 
    const supplier = await Supplier.findOne({supplierID:supplierID}); 
  if (!supplier || supplier.userId.toString() !== req.userId) { 
    return res.status(404).json({ error: 'Customer not found or unauthorized' }); 
  } 
    const transactions = await Transaction.find({supplierID:supplierID});
    res.json(transactions); 
  } 
    catch (error) { console.error('Fetch transactions error:', error); 
      res.status(500).json({ error: 'Failed to fetch transactions' }); 
    } });

router.get('/supplier/:supplierID', authenticateUser, async(req, res) => {
  const { supplierID } = req.params; // Extract customerID from the route
  // const customer = customer.find((c) => c.customerID === customerID);
  const supplier = await Supplier.findOne({supplierID:supplierID});
  // findOne({id: id});
if (!supplier || supplier.userId.toString() !== req.userId) {
  return res.status(404).json({ error: 'Customer not found or unauthorized' });
}

  if (!supplier) {
    return res.status(404).json({ error: 'Customer not found' }); // Respond with 404 if not found
  }

  res.json(supplier); // Respond with the customer details
});

module.exports = router;
