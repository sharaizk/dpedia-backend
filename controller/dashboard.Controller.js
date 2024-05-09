const Book = require("../models/book.model");
const Solution = require("../models/solution.model");
const Category = require("../models/category.model");
const Order = require("../models/order.model");
const { catchAsync } = require("./errorController");
const appError = require("../utils/appError");

exports.dashboardStats = catchAsync(async (req, res, next) => {
  const bookCount = await Book.countDocuments({}).exec();
  const solutionCount = await Solution.countDocuments({}).exec();
  const categoryCount = await Category.countDocuments({}).exec();
  const orderCount = await Order.countDocuments({}).exec();

  if (!bookCount && solutionCount && !categoryCount && orderCount) {
    return next(new appError("No Data found", 404));
  } else
    res.status(200).json({
      message: "All count recived successfully ",
      bookCount,
      solutionCount,
      categoryCount,
      orderCount,
    });
});
