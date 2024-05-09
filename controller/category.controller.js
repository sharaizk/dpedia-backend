const Category = require("../models/category.model");
const { catchAsync } = require("./errorController");
const apiFeatures = require("../utils/apiFeatures");
const appError = require("../utils/appError");
const { NotAvailable } = require("../utils/status");
const {
  extractKeywords,
  generateMetaDescription,
  removeHtmlTags,
} = require("../utils/stringFunctions");
const slugify = require("slugify");

exports.getAllCategoriesWithQuestions = catchAsync(async (req, res, next) => {
  const response = await Category.find(
    { level: 1 },
    { name: 1, _id: 1, iconName: 1, iconColor: 1, slug: 1, url: 1 }
  );
  if (!response) {
    return next(new appError("No Category found", 404));
  } else res.status(200).send(response);
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const CategoryResponse = await new apiFeatures(
    Category.find(
      {},
      { name: 1, _id: 1, parentId: 1, level: 1, slug: 1, url: 1 }
    ).populate({
      path: "parentId",
      select: "name _id",
    }),
    req.query
  )
    .filter()
    .sort()
    .pagination().query;
  const totalCategories = await new apiFeatures(
    Category.countDocuments({}),
    req.query
  ).filter().query;

  if (!CategoryResponse) {
    return next(new appError("No Category found", 404));
  } else
    res.status(200).json({ categories: CategoryResponse, totalCategories });
});

exports.getOneByName = catchAsync(async (req, res, next) => {
  const { url } = req.params;
  const response = await Category.findOne({ url: { $eq: url } }, { __v: 0 });
  if (!response) {
    return next(new appError("No Category found", 404));
  } else res.status(200).json(response);
});

exports.getCategoryDetail = catchAsync(async (req, res, next) => {
  const { categoryId } = req.query;
  const categoryDetailResponse = await Category.findOne({
    _id: categoryId,
  }).populate({ path: "parentId", select: "name _id" });

  if (!categoryDetailResponse) {
    return next(new appError("No Category Found", 404));
  }
  const categoryDetails = {
    name: categoryDetailResponse.name,
    level: categoryDetailResponse.level,
    parentName: categoryDetailResponse?.parentId?.name || NotAvailable,
    parentId: categoryDetailResponse?.parentId?._id || NotAvailable,
    description: categoryDetailResponse?.description,
    color: categoryDetailResponse?.iconColor || NotAvailable,
    icon: categoryDetailResponse?.iconName || NotAvailable,
  };
  return res.status(200).json({ detail: categoryDetails });
});

exports.addCategory = catchAsync(async (req, res, next) => {
  const { title, parentId, description, level, color, icon } = req.body;

  if (!title || !description || !level || !color || !icon) {
    return next(new appError("provide proper data", 403));
  }

  const metaKeywords = extractKeywords(description);

  const metaDescription = generateMetaDescription(metaKeywords);

  const url = title.replace(" ", "-").toLowerCase();

  const metaTitle = title + " homework help";

  const truncateSize = description.length > 120 ? 120 : description.length;

  const slug = slugify(
    removeHtmlTags(description)
      .toLowerCase()
      .substring(0, truncateSize)
  );

  if (parentId === "N/A") {
    const newCategory = new Category({
      name: title,
      description,
      slug: slug,
      metaDescription,
      metaKeywords,
      url,
      metaTitle,
      leve: parseInt(level),
      iconColor: color,
      iconName: icon,
    });

    await newCategory.save();

    return res.status(200).json({ detail: newCategory });
  }

  const newCategory = new Category({
    name: title,
    description,
    level: parseInt(level),
    metaDescription,
    metaKeywords,
    url,
    slug: slug,
    metaTitle,
    parentId,
    iconColor: color,
    iconName: icon,
  });

  await newCategory.save();

  return res.status(200).json({ detail: newCategory });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const { title, description, color, icon } = req.body;
  const { categoryId } = req.params;

  if (!title || !description || !categoryId || !color || !icon) {
    return next(new appError("provide proper data", 403));
  }

  const metaKeyWords = extractKeywords(description);

  const metaDescription = generateMetaDescription(metaKeyWords);

  const url = title.replace(" ", "-").toLowerCase();

  const metaTitle = title + " homework help";

  const truncateSize = description.length > 120 ? 120 : description.length;

  const slug = slugify(
    removeHtmlTags(description)
      .substring(0, truncateSize)
      .toLowerCase()
  );

  await Category.updateOne(
    { _id: categoryId },
    {
      $set: {
        name: title,
        description: description,
        metaTitle: metaTitle,
        metaDescription: metaDescription,
        metaKeyWords: metaKeyWords,
        url: url,
        iconColor: color,
        iconName: icon,
        slug: slug,
      },
    }
  );

  return res.status(200).json({ detail: "category update" });
});

exports.getAllByLevel = catchAsync(async (req, res, next) => {
  const { level } = req.query;
  if (!level) {
    return res.status(404).json({
      message: "Please provide the level you want to search",
    });
  }
  const level3Categories = await Category.find({ level: 3 }).sort({ name: 1 });

  return res.status(200).json({
    message: "Categories found",
    data: level3Categories,
  });
});
