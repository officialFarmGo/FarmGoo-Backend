const router = require('express').Router()
const {authenticate} = require('../middleWare/auth')

const {createFarmKyc, GetFarmerKyc} = require('../controller/farmKycController')

router.post('/create/:farmId', createFarmKyc)

router.get('/getKyc', authenticate, GetFarmerKyc)

module.exports = router