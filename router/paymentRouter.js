const router = require('express').Router()

const {initializePayment} = require('../controller/paymentContr')

const {authenticate} = require('../middleWare/auth')

router.post('/make-Payment', authenticate, initializePayment)

module.exports = router

