const router = require('express').Router()


const {dashBoardOverview, activeDeliveriesOverview, getFarmerWallet, farmerTrackDelivery, getOneFarmer} = require('../controller/farmerDashboard')

const {authenticate} = require('../middleWare/auth')

router.get('/farmDash', authenticate, dashBoardOverview)

router.get('/activeDeliveries', authenticate, activeDeliveriesOverview)

router.get('/farmerWallet', authenticate, getFarmerWallet)

router.get('/trackDelivery/:deliveryId', authenticate, farmerTrackDelivery)

router.get('/getOneFarmer', authenticate, getOneFarmer)

module.exports = router