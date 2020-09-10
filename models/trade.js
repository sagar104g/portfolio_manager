const mongoose = require('mongoose');

const { Schema } = mongoose;

const tradeSchema = new Schema({
  symbol: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  shares: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  createdOn: {
    type: Date,
    default: new Date(),
    required: true
  },
  active: {
    type: Boolean,
    default: true,
    required: true
  }
});

const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;
