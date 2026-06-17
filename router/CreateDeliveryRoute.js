const router = require('express').Router()

const {createDelivery, acceptDelivery, completeDelivery, estimateDeliveryPrice, rejectDelivery}= require('../controller/createDeliveryController')
const {testDistane} = require('../controller/deliveryController')
const { createDeliveryValidator, acceptDeliveryValidator, completeDeliveryValidator } = require('../middleWare/deliveryValidator')


const {authenticate} = require('../middleWare/auth')

router.post('/createDelivery/:vehhicleId', authenticate, createDeliveryValidator, createDelivery)
router.post('/testing', testDistane)

router.patch('/accept-Delivery/:deliveryId', authenticate, acceptDeliveryValidator, acceptDelivery)

router.post('/completeDelivery/:deliveryId', authenticate, completeDeliveryValidator, completeDelivery)

router.post('/estimateDeliveryPrice', estimateDeliveryPrice)

router.post('/rejectDelivery/:deliveryId', authenticate, rejectDelivery)

module.exports = router


