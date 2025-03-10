const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerID: { type: String, unique: true, required: true },
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  ByPhoneNumber: { type:Number, required:true },
  userId: { type: String, ref: 'User', required: true },
});

module.exports = mongoose.model('Customer-land', customerSchema);
