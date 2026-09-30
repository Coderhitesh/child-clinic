const mongoose = require('mongoose');

// One document per named sequence; incremented atomically so ids never repeat.
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', counterSchema);
