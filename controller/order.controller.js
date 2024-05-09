const Order = require("../models/order.model");
const Solution = require("../models/solution.model");
const Category = require("../models/category.model");
const apiFeatures = require("../utils/apiFeatures");
const { catchAsync } = require("./errorController");
const appError = require("../utils/appError");

exports.getOrder = async (req, res, next) => {
  const { orderToken } = req.body;
  try {
    const response = await Order.findOne({ orderToken }).populate({
      path: "solutionId",
      select: "+answer",
    });

    if (!response) {
      const solutionResponse = await Solution.find({}, null, { limit: 6 });
      return res.status(404).json({
        message: "Order not found",
        data: solutionResponse,
      });
    }

    const dect = Solution.getDecryptedAnswer(response?.solutionId?.answer);
    if (response?.viewCount < 5) {
      const categories = await Category.getCategoriesFromId(
        response?.solutionId?.category
      );
      // await Order.updateViewCount(orderToken)
      res.status(200).send({
        answer: dect,
        viewCount: response?.viewCount,
        downloadCount: response?.downloadCount,
        question: response?.solutionId?.question,
        category: categories,
        bookTitle: response.solutionId.book.title,
        title: response.solutionId.title,
        metaDescription: response.solutionId.metaDescription,
      });
    } else if (response)
      return res.status(200).send({ message: "View limit reached" });
  } catch (error) {
    return res.status(500).send({ message: "Unexpected Server Error" });
  }
};

exports.getAllOrder = catchAsync(async (req, res, next) => {
  const orderResponse = await new apiFeatures(
    Order.find({}).populate({
      path: "solutionId",
      select: ["title", "question"],
    }),
    req.query
  )
    .filter()
    .sort()
    .pagination().query;
  const totalOrders = await new apiFeatures(
    Order.countDocuments({}),
    req.query
  ).filter().query;
  if (!orderResponse) {
    return next(new appError("No Category found", 404));
  }
  return res
    .status(200)
    .json({ ordersData: orderResponse, totalOrders: totalOrders });
});

exports.viewOrderDetails = catchAsync(async (req, res, next) => {
  const { orderToken } = req.query;
  if (!orderToken) {
    return next(new appError("No Category found", 404));
  }
  const orderDetailResponse = await Order.findOne(
    { orderToken: orderToken },
    { orderToken: 0 }
  )
    .populate({
      path: "customerId",
      select: "name email",
    })
    .populate({
      path: "solutionId",
      select: "title price question book category",
      populate: {
        path: "book",
        select: "title",
      },
      populate: {
        path: "category",
        select: "title",
      },
    })
    .populate({
      path: "paymentId",
      select: "type",
    });
  if (!orderDetailResponse) {
    return next(new appError("No order found", 404));
  }
  const orderDetails = {
    status: orderDetailResponse.status,
    viewCount: orderDetailResponse.viewCount,
    downloadCount: orderDetailResponse.downloadCount,
    customerName: orderDetailResponse?.customerId?.name || "None",
    solutionTitle: orderDetailResponse?.solutionId?.title || "Empty",
    amount: orderDetailResponse?.amount,
    ipAddress: orderDetailResponse?.ipAddress,
    createdAt: orderDetailResponse?.createdAt,
    solutionId: orderDetailResponse?.solutionId?._id,
    question: orderDetailResponse?.solutionId?.question,
    paymentType: orderDetailResponse?.paymentId?.type,
    bookTitle: orderDetailResponse?.solutionId?.book?.title,
    solutionCategory: orderDetailResponse?.solutionId?.category?.name,
    bookId: orderDetailResponse?.bookId,
    categoryId: orderDetailResponse?.solutionId?.category?._id,
  };

  return res.status(200).json({ detail: orderDetails });
});
exports.getInvoice = async (req, res) => {
  const { orderToken } = req.query;

  try {
    const getOrderInvoice = await Order.findOne({
      orderToken: orderToken,
    }).populate([
      { path: "solutionId", select: ["title"] },
      { path: "customerId", select: ["name", "email"] },
    ]);

    if (!getOrderInvoice)
      return res
        .status(404)
        .json({ message: "Order Token Not Found or Invalid" });
    res.status(200).json({
      invoice: getOrderInvoice,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong in fetching" });
  }
};

exports.getSolutionOrderDetail = async (req, res) => {
  try {
    const bookId = req.query.bookId;
    const solutionId = req.query.solutionId;
    const allSolutionData = await Order.find(
      {
        $or: [
          {
            bookId,
          },
          {
            solutionId,
          },
        ],
      },

      {
        status: 1,
        paymentId: 1,
        customerId: 1,
        solutionId: 1,
        createdAt: 1,
        amount: 1,
        orderToken: 1,
      }
    )
      // .select("+solutionId")
      .populate({ path: "paymentId", select: "type" })
      .populate({ path: "customerId", select: "name email" })
      .populate({ path: "solutionId", select: "title" });
    const orderCount = await Order.countDocuments({
      $or: [
        {
          bookId,
        },
        {
          solutionId,
        },
      ],
    }).exec();
    return res.status(201).json({ orderCount, allSolutionData });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "unexpected server error" });
  }
};
