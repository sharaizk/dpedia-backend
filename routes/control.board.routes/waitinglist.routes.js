const express = require("express");
const waitingListController = require("../../controller/waitingListController");
const verifyAuth = require("../../middleware/authMiddleware");
const { verifyRole } = require("../../middleware/restrictToMiddleware");
const { ADMIN } = require("../../utils/types");

const router = express.Router();

router.get(
  "/",
  verifyAuth,
  verifyRole([ADMIN]),
  waitingListController.getAllEmails
);

module.exports = router;
