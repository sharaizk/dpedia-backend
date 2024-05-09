const mongoose = require("mongoose");
const waitingListSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "email is required"],
    },
    ipAddress: {
      type: String,
      required: [true, "email is required"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    istokenUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("waitinglist", waitingListSchema);
