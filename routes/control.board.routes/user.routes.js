const express = require("express");
const router = express.Router();
const userController = require('../../controller/userController');
const { verifyRole } = require("../../middleware/restrictToMiddleware");
const verifyAuth = require("../../middleware/authMiddleware");
const {ADMIN} = require('../../utils/types')

router.get(
  "/",
  verifyAuth,
  verifyRole([ADMIN]),
  userController.getAdminMembers
);
router.get(
  "/admin-detail",
  verifyAuth,
  verifyRole([ADMIN]),
  userController.getAdminDetails
);

module.exports = router;
