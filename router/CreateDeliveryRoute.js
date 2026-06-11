const router = require('express').Router()

const {createDelivery, acceptDelivery, completeDelivery}= require('../controller/createDeliveryController')
const {testDistane} = require('../controller/deliveryController')

const {authenticate} = require('../middleWare/auth')

router.post('/createDelivery/:vehhicleId', authenticate, createDelivery)
router.post('/testing', testDistane)

router.patch('/accept-Delivery/:deliveryId', authenticate, acceptDelivery)

router.post('/completeDelivery/:deliveryId', authenticate, completeDelivery)

module.exports = router