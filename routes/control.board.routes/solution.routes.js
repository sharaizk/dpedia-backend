const express = require("express");
const router = express.Router();
const solutionController = require("../../controller/solution.controller");
const verifyAuth = require("../../middleware/authMiddleware");
const { verifyRole } = require("../../middleware/restrictToMiddleware");
const { ADMIN } = require("../../utils/types");
router.get(
  "/",
  verifyAuth,
  verifyRole([ADMIN]),
  solutionController.getSolutionsAdmin
);
router.get(
  "/solution-detail",
  verifyAuth,
  verifyRole([ADMIN]),
  solutionController.SingleQuestionDetail
);
router.get(
  "/search",
  verifyAuth,
  verifyRole([ADMIN]),
  solutionController.SearchWithInSolution
);
router.post(
  "/update-status",
  verifyAuth,
  verifyRole([ADMIN]),
  solutionController.updateSolutionStatus
);

module.exports = router;
