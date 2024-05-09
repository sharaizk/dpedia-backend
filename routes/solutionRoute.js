const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const solutionController = require("../controller/solution.controller");

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("admin", "dataentry", "qa"),
    solutionController.addSolution
  )
  .get(solutionController.getSolutionQuestions);

router.get("/:slug", solutionController.getSingleSolution);
router.get("/category/search", solutionController.getSolutionsByCategory);
router.get("/book/search", solutionController.getSolutionsByBook);
router.post("/initiate-checkout/:slug", solutionController.initiateCheckout);
router.get("/elastic/search", solutionController.QuestionsEs);

router.get("/related/question", solutionController.RelatedQuestion);

router.post("/de/upload", solutionController.uploadSolutions);
module.exports = router;
