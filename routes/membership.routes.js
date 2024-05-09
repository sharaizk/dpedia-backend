const router = require("express").Router();

const {
  createMembership,
  cancelSubscription,
} = require("../controller/membership.controller");

router.post("/create-subscription", createMembership);
router.patch("/cancel-subscription", cancelSubscription);

module.exports = router;
