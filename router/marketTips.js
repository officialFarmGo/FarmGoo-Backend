const router = require('express').Router()

const {createMarketTip} = require('../controller/marketTips')

router.post('/createTips', createMarketTip)

module.exports = router