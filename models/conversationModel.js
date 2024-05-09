const mongoose = require('mongoose');

const conversationScheme = mongoose.Schema({
  initatedById: { type: Number, required: true },
  initatedWithId: { type: Number, required: true },

  messages: [{
    senderId: { type: Number, required: true },
    receiverId: { type: Number, required: true },
    createdAt: { type: Date, required: true },
    text: { type: String, required: true },
    conversationStatus: {
      type: String,
      required: true,
      enum: ['active', 'deactive', 'suspended', 'pending'],
    }
  }]
});

module.exports = mongoose.model('conversation', conversationScheme);
