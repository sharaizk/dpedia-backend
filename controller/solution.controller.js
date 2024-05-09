const appError = require("../utils/appError");
const apiFeatures = require("../utils/apiFeatures");
const emailHandler = require("../utils/email");
const { catchAsync } = require("../controller/errorController");
const Solution = require("../models/solution.model");
const Book = require("../models/book.model");
const {
  extractKeywords,
  generateMetaDescription,
  removeHtmlTags,
  getWordCount,
} = require("../utils/stringFunctions");
const { writeToSitemap } = require("./sitemapController");
const SearchLog = require("./../models/searchLogModel");
const {
  searchIndex,
  getAllFromIndex,
  RelatedSearch,
} = require("../utils/elasticSearch");
const Category = require("../models/category.model");

// const vision = require('@google-cloud/vision');

// const sql = require('./../config/sql');
const generatePromise = require("../utils/generatePromise");

// const ElasticSearch = require('../utils/elasticSearch');

const calculatePrice = (description) => {
  const length = getWordCount(description);

  if (length > 0 && length <= 30) {
    return 1.49;
  } else if (length > 30 && length <= 100) {
    return 1.99;
  } else if (length > 100 && length < 200) {
    return 2.49;
  } else return 3.49;
};

exports.addSolution = catchAsync(async (req, res, next) => {
  // ElasticSearch.createMapping('solutions',{
  //   id: { type: 'integer' },
  //   question: { type: 'text' },
  //   title: { type: 'text' },
  //   transcribedText: { type: 'text' }
  // });return;
  // console.log(solutions);
  // const result = ElasticSearch.bulkIndex('solutions', solutions);
  // console.log(result);
  // return res.status(200).json(result);

  // 1) Get data from request
  const { book, category, question, answer } = req.body;

  // 1.1) fetch title
  let title = question.substr(0, 50);
  title = removeHtmlTags(title);

  // 1.2) Fetch keywords
  const metaKeywords = extractKeywords(question);

  // 1.3) Clean meta description
  const metaDescription = generateMetaDescription(question);

  //  if (answer.length > 0 && answer.length < )

  const price = calculatePrice(answer);

  // 2) Create Db file
  const solution = new Solution({
    book,
    category,
    price,
    title,
    question,
    answer,
    status: 0,
    metaKeywords,
    metaDescription,
  });

  // 3) convert images to transcrib ed text
  // const client = vision.ImageAnnotatorClient();
  // const [result] = await client.text('https:');
  // const visionApi = 'https://vision.googleapis.com/v1/images:annotate?alt=json&key=' + process.env.GOOGLE_VISION_API_KEY;

  // 4) Append Transcribed text the description

  // 5) set uploadedBy
  solution.entryInformation.uploadedBy = req.user._id;

  result = await solution.save();

  // 7) Insert the url into the sitemapj
  const appendingUrl = "/homework-help/questions-and-answers/";
  urlObject = { url: appendingUrl + result.slug };
  console.log(urlObject);
  writeToSitemap(urlObject);

  // 8) Send response
  res.status(201).json({
    message: "created successfully",
    solution: result,
  });
});

exports.getSolutionQuestions = catchAsync(async (req, res, next) => {
  // Page

  const list = await new apiFeatures(
    Solution.find().populate({
      path: "category",
      select: "name url parentId",
      populate: {
        path: "parentId",
        select: "name url parentId",
        populate: { path: "parentId", select: "name url" },
      },
    }),
    req.query
  )
    .filter()
    .fieldsLimiting()
    .sort()
    .pagination().query;
  const totalSolutions = await Solution.countDocuments({}).exec();
  res.status(200).json({
    message: "Fetched Question successfully",
    data: list,
    totalSolutions,
  });
});

exports.getSingleSolution = catchAsync(async (req, res, next) => {
  // 1) Find Solution By the url

  // Answer view token will include answer field from the database
  // const solution = await new apiFeatures(
  // Solution.findOne({
  //   'slug': req.params.slug,
  //   token: process.env.ANS_VIEW_TOKEN
  // })
  // , { fields: "+answer" }).fieldsLimiting().query;

  const solution = await Solution.findOne({}).populate({
    path: "category",
    select: "name url parentId -_id",
    populate: {
      path: "parentId",
      select: "name url parentId -_id",
      populate: { path: "parentId", select: "name url -_id" },
    },
  });

  //2) If the solution not found
  if (!solution) {
    return next(new appError("Not Found!", 404));
  }

  // Get the decrypted Answer
  // const answer = await solution.getSingleSolution(req.params.slug);

  //3) Return Response
  res.status(200).json({
    data: solution,
    message: "Found Successfully",
  });
});

exports.searchSolution = catchAsync(async (req, res, next) => {
  // 1) Get the search Query

  const searchTerm = req.body.search;
  const clientIp = req.connection.remoteAddress;

  // 2) Find the occurance of query in search log
  const prevSearch = SearchLog.findOne({ query: searchTerm });

  // 3) Add search Log logic

  if (prevSearch) {
    // increase the search count by 1
    prevSearch.count = prevSearch.count + 1;
    prevSearch.ip.push(clientIp);
    await prevSearch.save();
  } else {
    const searchLog = new SearchLog();
    searchLog = {
      query: searchTerm,
      ip: req.connection.remoteAddress,
      count: 1,
    };
  }

  // 4) Search From elastic search index

  // 5) Generate the response
});

exports.initiateCheckout = catchAsync(async (req, res, next) => {});

exports.getSolutionsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.query;

  const childCategories = await Category.getCategoriesFromParent(category);
  const solutionResponse = await new apiFeatures(
    Solution.find(
      { category: { $in: childCategories } },
      { title: 1, category: 1, question: 1, slug: 1 }
    ).populate({
      path: "category",
      select: "name url parentId",
      populate: [
        {
          path: "parentId",
          select: "name url parentId",
          populate: [{ path: "parentId", select: "name url" }],
        },
      ],
    }),
    req.query
  ).pagination().query;
  const totalSolutions = await Solution.countDocuments({
    category: { $in: childCategories },
  });
  if (!solutionResponse) {
    return next(new appError("No Question Found!", 404));
  }
  return res.status(200).send({ data: solutionResponse, totalSolutions });
});

exports.getSolutionsByBook = catchAsync(async (req, res, next) => {
  const { book } = req.query;
  const realtedBook = await Book.findOne({ slug: book });

  const solutionResponse = await new apiFeatures(
    Solution.find(
      { book: realtedBook },
      { title: 1, category: 1, question: 1, slug: 1 }
    ).populate({
      path: "category",
      select: "name url parentId",
      populate: [
        {
          path: "parentId",
          select: "name url parentId",
          populate: [{ path: "parentId", select: "name url" }],
        },
      ],
    }),
    req.query
  ).pagination().query;
  const totalSolutions = await Solution.countDocuments({
    book: realtedBook,
  });
  if (!solutionResponse) {
    return next(new appError("No Question Found!", 404));
  }
  return res.status(200).send({ data: solutionResponse, totalSolutions });
});

exports.QuestionsEs = catchAsync(async (req, res, next) => {
  const { query, limit, page, isRelated = false } = req.query;
  const type = "question";
  const from = page ? (page - 1) * limit : 0;
  const size = limit ? limit : 5;
  let resp;
  if (query) {
    resp = await searchIndex("solutions", type, query, from, size, isRelated);
  } else {
    resp = await getAllFromIndex("solutions", from, size);
  }
  if (!resp || resp.length === 0) {
    return next(new appError("No Question Found!", 404));
  }
  return res.status(200).send(resp);
});

exports.getSolutionsAdmin = catchAsync(async (req, res, next) => {
  // Page

  const solutionsResponse = await new apiFeatures(
    Solution.find()
      .populate("orderCount")
      .populate({
        path: "category",
        select: "name url _id",
        populate: [
          {
            path: "parentId",
            select: "name url _id",
            populate: [{ path: "parentId", select: "name url -_id" }],
          },
        ],
      }),
    req.query
  )
    .filter()
    .fieldsLimiting()
    .sort()
    .pagination().query;

  const totalSolutions = await new apiFeatures(
    Solution.countDocuments({}),
    req.query
  ).filter().query;

  const statusCount = await Solution.aggregate([
    {
      $facet: {
        Active: [{ $match: { status: { $eq: true } } }, { $count: "status" }],
        InActive: [
          { $match: { status: { $eq: false } } },
          { $count: "status" },
        ],
      },
    },
    {
      $project: {
        active: { $arrayElemAt: ["$Active.status", 0] },
        inActive: { $arrayElemAt: ["$InActive.status", 0] },
      },
    },
  ]);

  res.status(200).json({
    message: "Fetched Question successfully",
    data: solutionsResponse,
    totalSolutions,
    activeSolutions: statusCount[0].active,
    inActiveSolutions: statusCount[0].inActive,
  });
});

exports.RelatedQuestion = async (req, res, next) => {
  try {
    const { question, category } = req.query;
    const resp = await RelatedSearch("solutions", question, category);
    res.status(200).send(resp);
  } catch (error) {
    res.status(500).send({ error });
  }
};

exports.SingleQuestionDetail = catchAsync(async (req, res, next) => {
  const { solutionId } = req.query;
  if (!solutionId) {
    return next(new appError("No Solution Id found.", 404));
  }
  const solutionResponse = await Solution.findOne(
    { _id: solutionId },
    { slug: 0, answer: 1 }
  ).select("+answer");
  const decryptedAnswer = Solution.getDecryptedAnswer(solutionResponse?.answer);
  const solutionDetail = {
    noOfOrders: solutionResponse?.noOfOrders,
    noOfDownloads: solutionResponse?.noOfDownloads,
    views: solutionResponse?.views,
    categoryName: solutionResponse?.category?.name,
    bookName: solutionResponse?.book?.title,
    bookId: solutionResponse?.book?._id,
    categoryId: solutionResponse?.category?._id,
    price: solutionResponse?.price,
    question: solutionResponse?.question,
    answer: decryptedAnswer,
  };
  return res.status(200).json({
    detail: solutionDetail,
  });
});

exports.SearchWithInSolution = catchAsync(async (req, res, next) => {
  const { searchedQuery } = req.query;
  const searchRegex = new RegExp(searchedQuery, "i") || searchedQuery;
  const searchedSolutions = await new apiFeatures(
    Solution.find({
      $or: [
        {
          title: { $regex: searchRegex },
        },
        {
          question: { $regex: searchRegex },
        },
        {
          metaDescription: { $regex: searchRegex },
        },
        {
          metaKeywords: { $regex: searchRegex },
        },
        {
          slug: { $regex: searchRegex },
        },
      ],
    }),
    req.query
  ).pagination().query;

  const totalSolutions = await Solution.countDocuments({
    $or: [
      {
        title: { $regex: searchRegex },
      },
      {
        question: { $regex: searchRegex },
      },
      {
        metaDescription: { $regex: searchRegex },
      },
      {
        metaKeywords: { $regex: searchRegex },
      },
      {
        slug: { $regex: searchRegex },
      },
    ],
  });

  return res
    .status(200)
    .json({ data: searchedSolutions, totalSolutions: totalSolutions });
});

exports.uploadSolutions = catchAsync(async (req, res, next) => {
  const { solutions, categoryId, bookTitle } = req?.body;
  if (!solutions || !categoryId) {
    return next(new appError("Incomplete data found", 401));
  }

  const uploadedBook = await Book.findOne({ title: bookTitle });

  const readySolutions = await Promise.all(
    solutions.map((solution) => {
      let title = solution.questionDetail.substr(0, 50);
      title = removeHtmlTags(title);
      const metaKeywords = extractKeywords(solution.questionDetail);
      const metaDescription = generateMetaDescription(solution.questionDetail);
      const decryptedAnswer = Solution.getDecryptedAnswer(solution.answer);
      const price = calculatePrice(decryptedAnswer);
      return {
        book: uploadedBook._id,
        question: solution.questionDetail,
        answer: solution.answer,
        metaKeywords: metaKeywords,
        price: price,
        metaDescription: metaDescription,
        category: categoryId,
      };
    })
  );
  const uploadedSolutions = await Solution.insertMany(readySolutions);
  if (!uploadedSolutions) {
    return res.status(400).json({
      message: "Couldn't Upload the solutions",
    });
  }
  return res.status(200).json({
    message: "Book Uploaded Successfully",
  });
});

exports.updateSolutionStatus = catchAsync(async (req, res, next) => {
  const { status, solutionId } = req.body;

  if (!solutionId) {
    return next(new appError("Incomplete data found", 400));
  }

  const isUpdated = await Solution.updateOne(
    { _id: solutionId },
    { $set: { status: status } }
  );

  if (!isUpdated) {
    return next(new appError("cannot update try again", 422));
  }

  return res.status(201).json({
    message: "Solution Updated Successfully",
  });
});
