const router = require('express').Router()

const {testDistane} = require('../controller/deliveryController')


router.post('/testing', testDistane)

module.exports = router