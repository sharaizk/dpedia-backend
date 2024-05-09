const express = require("express");
const Order = require("../../controller/order.controller");
const verifyToken = require("../../middleware/authMiddleware");
const { verifyRole } = require("../../middleware/restrictToMiddleware");
const { ADMIN } = require("../../utils/types");
const router = express.Router();
router.get("/", verifyToken, verifyRole([ADMIN]), Order.getAllOrder);
router.get(
  "/order-details",
  verifyToken,
  verifyRole([ADMIN]),
  Order.viewOrderDetails
);

router.get(
  "/solution-order-detail",
  verifyToken,
  verifyRole([ADMIN]),
  Order.getSolutionOrderDetail
);

// router.get("/solution-order-detail", Order.getSolutionOrderDetail);
module.exports = router;
