const express = require("express");
const bookController = require("../../controller/bookController");
const verifyAuth = require("../../middleware/authMiddleware");
const { verifyRole } = require("../../middleware/restrictToMiddleware");
const { ADMIN } = require("../../utils/types");

const router = express.Router();

router.get(
  "/",
  verifyAuth,
  verifyRole([ADMIN]),
  bookController.getAllBooks
);

router.get(
  "/book-detail",
  verifyAuth,
  verifyRole([ADMIN]),
  bookController.getBookDetails
);
router.get(
  "/search",
  verifyAuth,
  verifyRole([ADMIN]),
  bookController.searchWithInBook
);

module.exports = router;
