const express = require("express");
const dashboardController = require("../../controller/dashboard.Controller");
const verifyAuth = require("../../middleware/authMiddleware");
const { verifyRole } = require("../../middleware/restrictToMiddleware");
const { ADMIN } = require("../../utils/types");

const router = express.Router();

router.get(
  "/",
  verifyAuth,
  verifyRole([ADMIN]),
  dashboardController.dashboardStats
);

module.exports = router;
