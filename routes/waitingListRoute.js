const express = require("express");
const waitingListController = require("../controller/waitingListController");

const router = express.Router();

router.post("/add-email", waitingListController.addToWaitingList);
router.post("/email-verify", waitingListController.verifyToken);


module.exports = router;
