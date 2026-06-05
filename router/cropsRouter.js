const router = require('express').Router()

const {createCrops, getCrops} = require('../controller/cropsController')

router.post('/create-Crops', createCrops)

router.get('/getAllCrops', getCrops)

module.exports = router