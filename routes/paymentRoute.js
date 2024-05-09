const express = require("express")
const {payPament,paypalPayment} = require('../controller/payment.controller')
const router = express.Router()

router.post('/pay', payPament)
router.post('/paypal-pay',paypalPayment)
module.exports = router