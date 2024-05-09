const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Solution = require("../models/solution.model");
const orderSchema = mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: true,
      ref: "customer",
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
    },
    solutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "solution",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["success", "pending", "failed"],
      default: "pending",
    },
    ipAddress: {
      type: String,
      required: true,
    },
    feedback: {
      rating: {
        type: Number, // Number from 1 to 5
        min: 1,
        max: 5,
        message: "Rating cannot be less than 1 and cannot be more than 5",
      },
      comment: {
        type: String,
      },
    },
    orderToken: {
      type: String,
      default: "",
    },
    viewCount: {
      type: Number,
      min: 0,
      max: 4,
      default: 0,
    },
    downloadCount: {
      type: Number,
      min: 0,
      max: 4,
      default: 0,
    },
  },
  { timestamps: true }
);

orderSchema.statics.saveOrder = async function(
  customerId,
  solutionId,
  amount,
  ipAddress,
  bookId
) {
  const order = new this({ customerId, solutionId, amount, ipAddress, bookId });
  const newOrder = await order.save();
  return newOrder._id;
};

orderSchema.statics.checkIfOrderExists = async function(
  customerId,
  solutionId
) {
  return this.findOne({ customerId, solutionId });
};

orderSchema.statics.getOrderId = async function(customerId, solutionId) {
  const { _id: orderId } = await this.findOne(
    { customerId, solutionId },
    "_id"
  );
  return orderId;
};

orderSchema.statics.getSolutionId = async function(orderToken) {
  return this.findOne({ orderToken }, { solutionId: 1, _id: 0 });
};

orderSchema.statics.updateViewCount = async function(orderToken) {
  return this.updateOne({ orderToken }, { $inc: { viewCount: 1 } });
};

orderSchema.statics.updateStatus = function(orderId, status,pendingPaymentId) {
  return this.updateOne({ _id: orderId }, { $set: { status: status , paymentId:pendingPaymentId} });
};

orderSchema.statics.updateToken = function(orderId, orderToken) {
  return this.updateOne({ _id: orderId }, { $set: { orderToken } });
};

module.exports = mongoose.model("order", orderSchema);
