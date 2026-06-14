const router = require('express').Router()


const {dashBoardOverview, activeDeliveriesOverview, getFarmerWallet} = require('../controller/farmerDashboard')

const {authenticate} = require('../middleWare/auth')

router.get('/farmDash', authenticate, dashBoardOverview)

router.get('/activeDeliveries', authenticate, activeDeliveriesOverview)

router.get('/farmerWallet', authenticate, getFarmerWallet)

module.exports = router