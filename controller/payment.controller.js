const Payment = require("../models/payment.model");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const Solution = require("../models/solution.model");
const uuid4 = require("uuid4");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sendEmail = require("../utils/email");
const { catchAsync } = require("./errorController");
// const AppError = require("../utils/appError")

exports.payPament = async (req, res, next) => {
  // Destructing the values
  const {
    amount,
    type,
    name,
    email,
    slug,
    ipAddress,
    paymentId,
    bookId,
  } = req.body;
  // Checking if the parameters are valid
  if (
    !amount ||
    !type ||
    !email ||
    !slug ||
    !name ||
    !ipAddress ||
    !paymentId ||
    !bookId
  ) {
    res.status(404).send({ error: "Please fill out the form" });
  }
  let pendingPaymentId;
  let orderId;
  let token;
  let customerId;
  let solutionId;
  let title;
  let options = {
    email: "",
    subject: "",
    message: "",
  };
  try {
    customerId = await Customer.saveCustomer(name, email);
    const solutionResponse = await Solution.getSolutionId(slug);
    solutionId = solutionResponse._id;
    title = solutionResponse.title;
    orderId = await Order.saveOrder(
      customerId,
      solutionId,
      amount,
      ipAddress,
      bookId
    );
    pendingPaymentId = await Payment.savePayment(type, amount);
    // Converting $ amount to cents as Stripe accepts payment in  cents
    const amountinCents = parseFloat(amount) * 100;
    // Creating the payment Intent to inititate the payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountinCents,
      currency: "usd",
      payment_method: paymentId,
      confirm: true,
    });
    token = uuid4();
    await Payment.updateStatus(pendingPaymentId, "success", paymentId);
    await Order.updateStatus(orderId, "success", pendingPaymentId);
    await Order.updateToken(orderId, token);
    await Customer.updateOrderList(customerId, orderId);
    let link = `${process.env.ACCESS_ANSWER_BASE_URL}${token}`;
    options.email = email;
    options.subject = `Your order of ${title}`;
    options.message = `Hi, ${name} thank you for ordering ${title}, view your answer from this link: ${link}`;
    await sendEmail(options);

    // Sending the response
    res.status(200).json({
      message: `${req.body.amount}$ Payment Successful, A receipt will be sent`,
      orderToken: token,
    });
  } catch (error) {
    await Payment.updateStatus(pendingPaymentId, "failed");
    await Order.updateStatus(orderId, "failed", pendingPaymentId);
    await Customer.updateOrderList(customerId, orderId);
    if (error?.type) {
      // Sending the error which is provided by the stripe api
      res.status(404).json({ error: `${error?.raw?.message}` });
    } else {
      console.log(error);
      // Generic error response
      res.status(500).json({ error: "Something went wrong with the server" });
    }
  }
};

exports.paypalPayment = async (req, res) => {
  const {
    amount,
    type,
    name,
    email,
    slug,
    ipAddress,
    paymentToken,
    bookId,
  } = req.body;
  console.log(bookId);
  // Checking if the parameters are valid
  if (
    !amount ||
    !type ||
    !email ||
    !slug ||
    !name ||
    !ipAddress ||
    !paymentToken ||
    !bookId
  ) {
    res.status(404).send({ error: "Please fill out the form" });
  }
  try {
    const customerId = await Customer.saveCustomer(name, email);
    const solutionResponse = await Solution.getSolutionId(slug);
    const solutionId = solutionResponse._id;
    const title = solutionResponse.title;
    const orderId = await Order.saveOrder(
      customerId,
      solutionId,
      amount,
      ipAddress,
      bookId
    );
    const token = uuid4();
    const newPayment = new Payment({
      type,
      amount,
      status: "success",
      token: paymentToken,
    });
    const paymentInfo = await newPayment.save();
    await Order.updateStatus(orderId, "success", paymentInfo._id);
    await Order.updateToken(orderId, token);
    await Customer.updateOrderList(customerId, orderId);
    let link = `${process.env.ACCESS_ANSWER_BASE_URL}/${token}`;
    const options = {
      email: email,
      subject: `Your order of ${title}`,
      message: `Hi, ${name} thank you for ordering ${title}, view your answer from this link: ${link}`,
    };
    // await sendEmail(options);
    res.status(200).json({
      message: `${req.body.amount}$ Payment Successful, A receipt will be sent`,
      orderToken: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong with the server" });
  }
};
