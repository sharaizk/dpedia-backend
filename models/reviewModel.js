const mongoose = require("mongoose");
const reviewSchema = mongoose.Schema({
  createdAt: { type: String, required: true },
  description: { type: String, required: true },
  modifiedAt: { type: String, required: true },
  rating: { type: String, required: true },
  reviewQuestion: [
    { q1: String, required: true },
    { q2: String, required: true },
    { q3: String, required: true },
    { q4: String, required: true },
    { q5: String, required: true },
    { created_at: Date, required: true }
  ],
  userId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    }
  ],
  questionId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "question"
    }
  ]
});
module.exports = mongoose.Model("review", reviewSchema);
