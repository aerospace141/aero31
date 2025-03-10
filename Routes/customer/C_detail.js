const express = require('express');
const Customer = require('../../models/Customer');
const Chat = require('../../models/Chat');
const { authenticateUser }  = require('../../middleware/authentication');
const router = express.Router();
const Transaction = require('../../models/Transaction')


router.get('/customers', authenticateUser,  async (req, res) => {
  const byPhoneNumber = req.ByPhoneNumber;

  try {
    const customers = await Customer.find({ ByPhoneNumber: byPhoneNumber });
      // .sort({ createdAt: -1 });
      res.status(200).json(customers);
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
  }
});

router.use('/customer_who_added_me', authenticateUser, async (req, res, next) => {

  const byPhoneNumber = req.ByPhoneNumber; // Assuming the user's phone number is extracted from the JWT.

  try {
      const users = await Customer.find({ phoneNumber: byPhoneNumber })
      // const addedByUsers = users.map((record) => ({
          // addedByName: record.createdBy.name,
          // addedByPhone: record.createdBy.phoneNumber,
      
      res.status(200).json(users);
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users who added you', error: error.message });
  }
});

router.get("/transactions/summary", authenticateUser, async (req, res) => {
  try {
    const myPhoneNumber = req.ByPhoneNumber.toString(); // Ensure it's a string

    console.log("Fetching transactions for phone:", myPhoneNumber);

    // Get all received transactions
    const receivedTransactions = await Transaction.find({ receiver: myPhoneNumber });
    const totalReceived = receivedTransactions.reduce((acc, txn) => acc + txn.amount, 0);

    // Get all given transactions
    const givenTransactions = await Transaction.find({ sender: myPhoneNumber });
    const totalGiven = givenTransactions.reduce((acc, txn) => acc + txn.amount, 0);

    console.log("Total Received:", totalReceived, "Total Given:", totalGiven);

    res.json({ totalReceived, totalGiven, userId: req.userId, });
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    res.status(500).json({ message: "Server Error" });
  }
});




module.exports = router;
