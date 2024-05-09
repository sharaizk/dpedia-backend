const mongoose = require("mongoose");
const transactionSchema = mongoose.Schema({
  createdAt: { type: Date, required: true },
  amount: { type: Number, required: true },
  type: {enum:[""]},
  status: { enum: ["pending", "completed", "rejected"], required: true },
  token: { type: String, required: true },
  userId: [
    {
      type: Schema.Types.ObjectId,
      ref: "user"
    }
  ],
  // email: {type: String},
  paypal: [
    { paypalTransactionToken: String, required: true },
    { paypalUserFirstName: String, required: true },
    { paypalUserEmail: String, required: true },
    { paypalUserLastName: String, required: true },
    { createdAt: Date, required: true },
    { modifiedAt: Date, required: true }
  ],
  creditCard: [
    {
      cardNo: Number,
      required: true
    },
    {
      valid: Date,
      required: true
    }
  ]
});
module.exports = mongoose.Model("transaction", transactionSchema);
