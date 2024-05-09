const mongoose = require("mongoose");
const { getPositionOfLineAndCharacter } = require("typescript");
const questionSchema = mongoose.Schema({

  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    enum: ["active", "deactive", "pending", "suspended", "disputed"],
    required: true
  },
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },

  categoryId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category'
    }
  ],
  level: { enum: ["level 1", "level 2", "level 3"], required: true },
  postedAt: { type: Date, required: true },
  modifiedAt: { type: Date, required: true },
  url: { type: String, required: true },
  dueDate: { type: Date, required: true },
  price: { type: Number, required: true },
  attachment: [
    { size: String, required: true },
    { format: String, required: true },
    { createdAt: Date, required: true }
  ],
  bids: [
    { price: Number, required: true },
    { description: String, required: true },
    { status: { enum: ["active", "deactive", "pending"], required: true }},
    { createDate: Date, required: true },
    { modifiedAt: Date, required: true }
  ]
});
module.exports = mongoose.model("question", questionSchema);
