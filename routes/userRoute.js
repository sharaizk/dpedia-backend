const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const verifyToken = require("../middleware/authMiddleware");
const passport = require("passport");

//Authentication Routes
router.post("/sign-up", authController.createUser);
router.post("/sign-in", authController.login);
router.get("/get-profile", verifyToken, authController.loadUserProfile);

router.post("/auth/google", authController.googleLogin);

// Password Related Routes
router.route("/forget-password").post(authController.forgetPassword);
router.route("/reset-password/:token").patch(authController.resetPassword);
router.route("/verify-token").post(authController.verifyToken);
router
  .route("/update-password")
  .patch(authController.protect, authController.updatePassword);

module.exports = router;
