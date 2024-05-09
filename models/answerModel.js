const mongoose = require("mongoose");
const answerSchema = mongoose.Schema({
  description: { type: String, required: true },
  Status: {
    type: String,
    required: true,
    enum: ['active', 'deactive', 'suspended', 'pending']
  },
  createdAt: { type: Date, required: true },
  modifiedAt: { type: Date, required: true },
  attachment: [
    { attachedToId: String, required: true },
    { relatedTo: String, required: true },
    { size: String, required: true },
    { format: String, required: true },
    { createdAt: Date, required: true },
    { modifiedAt: Date, required: true }
  ],
  questionId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "question"
    }
  ],
  userId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    }
  ]
});
module.exports = mongoose.model("answer", answerSchema);
