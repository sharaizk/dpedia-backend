const express = require("express");
const router = express.Router();
const verifyAuth = require("../../middleware/authMiddleware");
const { verifyRole } = require("../../middleware/restrictToMiddleware");
const categoryController = require("../../controller/category.controller");
const { ADMIN } = require("../../utils/types");

router.get(
  "/",
  verifyAuth,
  verifyRole([ADMIN]),
  categoryController.getAllCategories
);
router.get(
  "/category-detail",
  verifyAuth,
  verifyRole([ADMIN]),
  categoryController.getCategoryDetail
);

router.post(
  "/add-category",
  verifyAuth,
  verifyRole([ADMIN]),
  categoryController.addCategory
);

router.put(
  "/update-category/:categoryId",
  verifyAuth,
  verifyRole([ADMIN]),
  categoryController.updateCategory
);

module.exports = router;
