const express = require("express");
const app = express();
const categoryRoutes = require("./category.routes");
const orderRoutes = require("./order.routes");
const solutionRoutes = require("./solution.routes");
const userRoutes = require("./user.routes");
const bookRoutes = require("./book.routes");
const waitingListRoutes = require("./waitinglist.routes");

app.use("/category", categoryRoutes);
app.use("/order", orderRoutes);
app.use("/solution", solutionRoutes);
app.use("/user", userRoutes);
app.use("/book", bookRoutes);
app.use("/waiting-list", waitingListRoutes);

module.exports = app;
