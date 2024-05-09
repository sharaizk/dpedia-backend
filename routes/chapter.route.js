const router = require("express").Router();
const { createChapter } = require("../controller/chapter.controller");

router.post("/create", createChapter);

module.exports = router;
