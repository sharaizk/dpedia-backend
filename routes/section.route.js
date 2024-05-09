const router = require("express").Router();
const { createSection } = require("../controller/section.controller");

router.post("/create", createSection);

module.exports = router;
