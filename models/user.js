const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },

  // otp:[{
  //   code: { type: String, required: true },
  //   expiry: { type: Date, required: true }
  // }],
   // Embed otpSchema as an object within userSchema

   firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // address: {
  //   street: String,
  //   city: String,
  //   state: String,
  //   postalCode: String,
  //   country: String
  // },
  // cart: [{
  //   productId: {
      
  //     type: Number,
  //     ref: 'Product' 
  //   },
  //   quantity: Number
  // }],
  // totalAmount: Number,
  // role: {
  //   type: String,
  //   enum: ['admin', 'user','member'],
  //   default: 'user',
  // },
  // likedBooks: [{ type: String, ref: 'Book' }] ,
  
});

const User = mongoose.model('User', userSchema);

module.exports = User;
