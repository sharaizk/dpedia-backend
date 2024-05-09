const Book = require("../models/book.model");
const apiFeatures = require("../utils/apiFeatures");
const { catchAsync } = require("../controller/errorController");
const appError = require("../utils/appError");
const { NotAvailable } = require("../utils/status");

exports.getAllBooks = async (req, res) => {
  try {
    const books = await new apiFeatures(
      Book.find({}, { bookNumber: 1, title: 1, authorName: 1, year: 1 })
        .populate({ path: "categoryId", select: "name" })
        .populate({
          path: "solutionCount",
          select: "name -book",
          populate: { path: "orderCount" },
        }),
      req.query
    ).pagination().query;

    const totalBook = await Book.countDocuments({}).exec();

    return res.status(201).json({ data: books, totalBook: totalBook });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "unexpected server error" });
  }
};

exports.getBookDetails = catchAsync(async (req, res, next) => {
  const { bookId } = req.query;
  if (!bookId) {
    return next(new appError("No Book Id found", 401));
  }

  const bookDetailResponse = await Book.findOne({ _id: bookId }).populate({
    path: "categoryId",
    select: "name",
  });
  if (!bookDetailResponse) {
    return next(new appError("No Book detail found", 404));
  }
  const detail = {
    title: bookDetailResponse?.title,
    description: bookDetailResponse?.description,
    authorName: bookDetailResponse?.authorName,
    category: bookDetailResponse?.categoryId?.name || NotAvailable,
  };
  return res.status(200).json({
    detail: detail,
  });
});

exports.uploadBook = catchAsync(async (req, res, next) => {
  const {
    category,
    title,
    description,
    authorName,
    isbn,
    coverImage,
  } = req?.body;
  if (
    !category ||
    !title ||
    !description ||
    !authorName ||
    !isbn ||
    !coverImage
  )
    return next(new appError("Please please provide full data", 401));
  const newBook = await Book.create({
    categoryId: category,
    title: title,
    description: description,
    authorName: authorName,
    isbn: isbn,
    coverImage: coverImage,
  });

  const savedBook = newBook.save();
  if (!savedBook) return next(new appError("Couldn't save the book", 404));

  return res.status(200).json(savedBook);
});

exports.searchWithInBook = catchAsync(async (req, res, next) => {
  const { searchedQuery } = req.query;
  const searchRegex = new RegExp(searchedQuery, "i");
  const searchedBooks = await new apiFeatures(
    Book.find({
      $or: [
        {
          title: { $regex: searchRegex },
        },
        {
          description: { $regex: searchRegex },
        },
        {
          authorName: { $regex: searchRegex },
        },
      ],
    }),
    req.query
  ).pagination().query;
  const totalBook = await Book.countDocuments({
    $or: [
      {
        title: { $regex: searchRegex },
      },
      {
        description: { $regex: searchRegex },
      },
      {
        authorName: { $regex: searchRegex },
      },
    ],
  });
  if (!searchedBooks) {
    return next(new appError("No Book Found", 404));
  }
  return res.status(200).json({ data: searchedBooks, totalBook: totalBook });
});

exports.getBookByCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.query;

  if (!categoryId) return next(new appError("bad input for book", 400));

  const books = await new apiFeatures(
    Book.find({ categoryId: categoryId }),
    req.query
  ).pagination().query;

  return res.status(200).json({ data: books });
});

exports.getBookBySlug = catchAsync(async (req, res) => {
  const { bookslug } = req.query;
  if (!bookslug) {
    return res.status(404).json({
      message: "Please provide a slug to search",
    });
  }

  const searchedBook = await Book.findOne({ slug: bookslug });

  if (!searchedBook) {
    return res.status(404).json({
      message: "Invalid book slug",
    });
  }

  return res.status(200).json({
    message: "Book found",
    data: searchedBook,
  });
});
