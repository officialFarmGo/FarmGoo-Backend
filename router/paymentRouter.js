const router = require('express').Router()

const {initializePayment, verifyPayment, handlePaymentWebhook} = require('../controller/paymentContr')

const {authenticate} = require('../middleWare/auth')

router.post('/make-Payment', authenticate, initializePayment)

router.post('/make-Payment/:receiverId',authenticate, initializePayment)

router.get('/verify-Payment', authenticate, verifyPayment)

router.post('/verify-webhook', handlePaymentWebhook)




module.exports = router

