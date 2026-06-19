const router = require('express').Router()


const {dashBoardOverview, activeDeliveriesOverview, getFarmerWallet, farmerTrackDelivery, getOneFarmer, updateFarmerProfile} = require('../controller/farmerDashboard')

const {upload, uploadToMemory } = require('../middleWare/multer')

const {authenticate} = require('../middleWare/auth')

router.get('/farmDash', authenticate, dashBoardOverview)

router.get('/activeDeliveries', authenticate, activeDeliveriesOverview)

router.get('/farmerWallet', authenticate, getFarmerWallet)

router.get('/trackDelivery/:deliveryId', authenticate, farmerTrackDelivery)

router.get('/getOneFarmer', authenticate, getOneFarmer)

router.patch('/updateFarmer', authenticate,  upload.fields([{name:'profilePicture'}]), updateFarmerProfile)

module.exports = router