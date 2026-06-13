const router = require('express').Router()

const {createVehicleType, getAllVehicles} = require('../controller/vehTypeCont')

router.post('/createCar', createVehicleType)

router.get('/allVehic', getAllVehicles)



module.exports = router

