const express = require("express");
const SearchLog = require("../../controller/searchLogController");
const verifyToken = require("../../middleware/authMiddleware");
const { verifyRole } = require("../../middleware/restrictToMiddleware");
const { ADMIN } = require("../../utils/types");
const router = express.Router();
router.get("/", verifyToken, verifyRole([ADMIN]), SearchLog.getAllSearchLog);

module.exports = router;
