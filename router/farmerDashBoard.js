const router = require('express').Router()


const {dashBoardOverview, activeDeliveriesOverview} = require('../controller/farmerDashboard')

const {authenticate} = require('../middleWare/auth')

router.get('/farmDash', authenticate, dashBoardOverview)

router.get('/activeDeliveries', authenticate, activeDeliveriesOverview)

module.exports = router