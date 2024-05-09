const mongoose = require('mongoose');
const disputeScheme = mongoose.Schema({

  studentId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  ],
  tutorId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  ],
  questionId:    {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'question'
  },

  reason: { type: Number, required: true },
  createdAt: { type: Date, required: true },
  disputeStatus: {
    type: String,
    required: true,
    enum: ['active', 'deactive', 'suspended', 'pending']
  },
  winner: { type: Number, required: true },
  resolvedAt: { type: Number, required: true },

  stance: [{

    askedFrom: { type: Number, required: true },
    askedBy: { type: Number, required: true },
    stanceAns: { type: String, required: true },

    attachment: {
      size: { type: String, required: true },
      format: { type: Date, required: true },
      createdAt: { type: Date, required: true }
    },

    stanceStatus: {
      type: String,
      required: true,
      enum: ['active', 'deactive', 'suspended', 'pending']
    },

    createdAt: { type: Date, required: true },

  }]
});

module.exports = mongoose.model('dispute', disputeScheme);
