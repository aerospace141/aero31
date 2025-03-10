const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  sender: { type: Number, ref: 'User' },
  receiver: { type: Number, ref: 'User', required: true },
  customerID: { type: String, ref: 'Customer', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  senderYou:{ type: String, require: true},

  isRead: { type: Boolean, default: false }, // New field to track if the message is read

});

module.exports = mongoose.model('Chat', ChatSchema);
