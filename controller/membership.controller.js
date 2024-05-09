const Membership = require("../models/membership.model");
const { catchAsync } = require("./errorController");
const User = require("../models/userModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { SUBSCRIPTION_PLANS } = require("../utils/constants");
exports.createMembership = catchAsync(async (req, res, next) => {
  const { purchaseDate, paymentId, email } = req.body;

  const selectedPlan = "MONTHLY";
  const user = await User.findOne({ email: email });
  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }
  const plan = SUBSCRIPTION_PLANS[selectedPlan];
  const customer = await stripe.customers.create({
    payment_method: paymentId,
    email: user.email,
    description: "Subscription",
    shipping: {
      name: "RD",
      address: {
        line1: "510",
        postal_code: "10115",
        city: "Berlin",
        state: "BE",
        country: "DE",
      },
    },
    invoice_settings: {
      default_payment_method: paymentId,
    },
  });

  if (!customer.id) {
    return next(new appError("Couldn't create the customer", 404));
  }

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [
      {
        price: plan,
      },
    ],
  });
  const newMemberShip = await Membership.create({
    userId: user?._id,
    purchaseDate: purchaseDate,
    plan: plan,
    status: "active",
    subscriptionId: subscription.id,
  });

  return res
    .status(200)
    .json({ message: "Congratulations! You are subscribed to the plan" });
});

exports.cancelSubscription = catchAsync(async (req, res, next) => {
  const { subscriptionId } = req.body;
  if (!subscriptionId) {
    return next(new appError("Please provide subscription id", 400));
  }

  const deletedSubscription = await stripe.subscriptions.del(subscriptionId);

  if (!deletedSubscription) {
    return next(
      new appError("Couldn't delete your subscription at the moment", 404)
    );
  }

  return res
    .status(200)
    .json({
      message: "You have successfully unsubscribed from your current plan",
    });
});
