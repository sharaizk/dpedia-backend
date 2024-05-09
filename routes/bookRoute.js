const express = require("express");
const router = express.Router();
const bookController = require("../controller/bookController")

router.get("/book-by-category", bookController.getBookByCategory);
router.post("/upload", bookController.uploadBook);
router.get("/all", bookController.getAllBooks);
router.get("/slug", bookController.getBookBySlug);


module.exports = router;
