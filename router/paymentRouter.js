const router = require('express').Router()

const {initializePayment, verifyPayment} = require('../controller/paymentContr')

const {authenticate} = require('../middleWare/auth')

router.post('/make-Payment', authenticate, initializePayment)

router.post('/make-Payment/:receiverId', initializePayment)

router.get('/verify-Payment', authenticate, verifyPayment)



module.exports = router

