const router = require("express").Router();
const {
  getSolutions,
  getCategories,
  createSitemap,
  getAllCategories,
  getByNames,
} = require("../controller/sitemapController");

router.get("/solution-sitemap", getSolutions);
router.get("/category-sitemap", getCategories);
router.post("/create", createSitemap);
router.get("/all", getAllCategories);
router.get("/one/:name", getByNames);

module.exports = router;