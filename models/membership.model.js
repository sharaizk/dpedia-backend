const mongoose = require("mongoose");
const {
  IN_ACTIVE,
  ACTIVE,
  PENDING,
  CANCELLED,
  REFUNDED,
  FREE_TRIAL,
  MONTHLY,
  THREE_MONTHS,
  SIX_MONTHS,
} = require("../utils/status");
const membershipSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  dailyLimit: {
    type: Number,
    default: 20,
  },
  remainingLimit: {
    type: Number,
    default: 10,
  },
  status: {
    type: String,
    default: IN_ACTIVE,
    enum: [IN_ACTIVE, ACTIVE, PENDING, CANCELLED, REFUNDED],
  },
  purchaseDate: {
    type: Date,
  },
  subscriptionId: {
    type: String,
    default: "",
  },
  plan: {
    type: String,
    default: FREE_TRIAL,
    enum: [FREE_TRIAL, MONTHLY, THREE_MONTHS, SIX_MONTHS],
  },
});

module.exports = mongoose.model("membership", membershipSchema);
