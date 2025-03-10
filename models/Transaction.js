const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  sender: { type: Number, ref: 'User', required: true },
  receiver: { type: Number, ref: 'User', required: true },
  customerID: { type: String, ref: 'Customer', required: true },
  transactionType: { type: String, enum: ['receive', 'give'], required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', TransactionSchema);