const express = require("express");
const Order = require("../controller/order.controller");
const verifyToken = require("../middleware/authMiddleware");
const { verifyRole } = require("../middleware/restrictToMiddleware");

const router = express.Router();
router.post("/get-order", Order.getOrder);
router.get("/get-invoice", Order.getInvoice);

module.exports = router;
