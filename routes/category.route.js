const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category.controller");

router.get("/", categoryController.getAllCategoriesWithQuestions);
router.get('/one/:url',categoryController.getOneByName)
router.get("/all", categoryController.getAllCategories);
module.exports = router;
