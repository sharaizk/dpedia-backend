const mongoose = require('mongoose');

const searchScheme = mongoose.Schema({
  query: { type: String, required: true },
  count: { type: Number, required: true },
  ip: [{ type: String, required: true }],
}, { timestamps: true });

module.exports = mongoose.model('searchlog', searchScheme);
