const router = require('express').Router()

const {initializePayment, verifyPayment, handlePaymentWebhook, withdrawFunds} = require('../controller/paymentContr')

const {authenticate} = require('../middleWare/auth')

router.post('/make-Payment', authenticate, initializePayment)

router.post('/make-Payment/:receiverId',authenticate, initializePayment)

router.get('/verify-Payment', authenticate, verifyPayment)

router.post('/verify-webhook', handlePaymentWebhook)

router.post('/withdraw', authenticate, withdrawFunds)


module.exports = router

