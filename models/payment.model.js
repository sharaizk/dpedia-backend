const mongoose = require("mongoose");
const paymentSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["paypal", "stripe"],
    },

    amount: { type: Number, required: true },
    token: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

paymentSchema.statics.savePayment=async function(type,amount){
  const payment = new this({type,amount})
  const newPayment = await payment.save()
  return newPayment._id
}

paymentSchema.statics.updateStatus = function(_id, status,token) {
  if(token){
    return this.updateOne({ _id }, { $set: {token: token,status:status} });
  }
  else{
    return this.updateOne({ _id }, { $set: {status:status} });
  }
};

module.exports = mongoose.model("payment", paymentSchema);
