const router = require('express').Router()

const {createVehicleType} = require('../controller/vehTypeCont')

router.post('/createCar', createVehicleType)

module.exports = router

