const router = require('express').Router()

const {createDelivery}= require('../controller/createDeliveryController')

const {authenticate} = require('../middleWare/auth')

router.post('/createDelivery', authenticate, createDelivery)

module.exports = router