const router = require('express').Router()


const {dashBoardOverview, activeDeliveriesOverview, getFarmerWallet, farmerTrackDelivery} = require('../controller/farmerDashboard')

const {authenticate} = require('../middleWare/auth')

router.get('/farmDash', authenticate, dashBoardOverview)

router.get('/activeDeliveries', authenticate, activeDeliveriesOverview)

router.get('/farmerWallet', authenticate, getFarmerWallet)

router.get('/trackDelivery/:deliveryId', authenticate, farmerTrackDelivery)

module.exports = router