const Solutions = require("../models/solution.model");
const Categories = require("../models/category.model");
const { catchAsync } = require("../controller/errorController");
const sitemap = require("../models/sitemap.models");

exports.getSolutions = catchAsync(async (req, res, next) => {
  const solutionResponse = await Solutions.find({
    status: true,
    isSitemaped: { $ne: true },
  }).select("_id slug");
  return res.status(200).json({ solutions: solutionResponse });
});

exports.getCategories = catchAsync(async (req, res, next) => {
  const categoryResponse = await Categories.find({}).select("name");
  return res.status(200).json({ categories: categoryResponse });
});

exports.createSitemap = catchAsync(async (req, res, next) => {
  const { link } = req.body;
  if (!link) {
    return res.status(403).json({
      message: "Please provide the link that you want to add",
    });
  }
  const currentSitemap = await sitemap.findOne({ length: { $lte: 40000 } });
  if (currentSitemap) {
    await sitemap.addToSitemap(currentSitemap._id, link);
    return res.status(200).json({
      message: "Sitemap, successfully updated",
    });
  }
  const recentSiteMap = await sitemap.getRecentSitemap();
  const index = recentSiteMap?.index ? recentSiteMap?.index + 1 : 0;
  const title = `sitemap-${index}.xml`;
  const createNewSitemap = await sitemap.createNewSitemap(title, index, link);
  return res.status(200).json({
    message: "Sitemap, successfully created",
  });
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const allSitemapResponse = await sitemap.find({}).select("name");

  return res.status(200).json({
    sitemaps: allSitemapResponse,
  });
});

exports.getByNames = catchAsync(async (req, res, next) => {
  const { name } = req.params;
  if (!name) {
    return res.status(403).json({
      message: "Please provide thee name of the sitemap",
    });
  }
  const oneSitemap = await sitemap.findOne(
    { name: name },
    { _id: 0, content: { url: 1 } }
  );
  return res.status(200).json({
    sitemap: oneSitemap,
  });
});