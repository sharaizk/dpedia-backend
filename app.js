const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
// Route Imports
const userRoutes = require("./routes/userRoute");
const solutionRoutes = require("./routes/solutionRoute");
const paymentRoutes = require("./routes/paymentRoute");
const customerRoutes = require("./routes/customer.route");
const orderRoutes = require("./routes/order.route");
const categoryRoutes = require("./routes/category.route");
const bookRoutes = require("./routes/bookRoute");
const waitingListRoutes = require("./routes/waitingListRoute");
const controllBoard = require("./routes/control.board.routes");
const sitemapRoutes = require("./routes/sitemap.route");
const chapterRoutes = require("./routes/chapter.route");
const searchLogRoutes = require("./routes/control.board.routes/searchLog.routes");
const DashboardRoutes = require("./routes/control.board.routes/Dashboard.routes");
const MembershipRoutes = require("./routes/membership.routes");
const cronJob = require("./utils/cronJob");
// const migrationRoutes = require("./routes/migratons.route");

// Development Plugins Import i.e [Logging]
const morgan = require("morgan");

// security imports
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
// const rateLimit = require("express-rate-limit");

// Error Handling Dependencies
const { errorHandler } = require("./controller/errorController");
const appError = require("./utils/appError");
// const { startSitemap } = require("./controller/sitemapController");

// const sql = require('./config/sql');

// 1) GLOBAL MIDDLEWARES

// Security HTTP headers
app.use(helmet());

// Limit the number of requests from a certain ip
// const limter = rateLimit({
//   // 100 requests from same ip in 1 hour
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too Many requests from this IP, please try again in an hour!",
// });

// Limit the no of request per ip
// app.use("/api", limter);

// Data Sanatization agains noSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Development Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// CORS Functionality
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use("/public", express.static(path.join(__dirname, "public")));

// 2) Routes
app.use("/api/user", userRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/solution", solutionRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/waiting-list", waitingListRoutes);
app.use("/api/controlboard", controllBoard);
app.use("/api/sitemap", sitemapRoutes);
app.use("/api/chapter", chapterRoutes);
app.use("/api/searchlog", searchLogRoutes);
app.use("/api/dashboard", DashboardRoutes);
app.use("/api/membership", MembershipRoutes);

// app.use("/api/migration", migrationRoutes);

// 3) Error Handeling

// 4) Start sitemap

// startSitemap();

// Generate 404 error on from server when the URL not found
app.all("*", (req, res, next) => {
  // generate the new error from the error class
  next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Handle errors of application
app.use(errorHandler);

module.exports = app;
