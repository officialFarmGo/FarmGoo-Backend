const router = require('express').Router()


const {driverDashboard, getDriverWallet, getDriverDeliveries, getAvailableJobs, getJobDetail, getOneDriver} = require('../controller/driverDashboard')

const {authenticate} = require('../middleWare/auth')

router.get('/driverDashBoard', authenticate, driverDashboard)

router.get('/driverWallet', authenticate, getDriverWallet)

router.get('/driverDeliveries', authenticate, getDriverDeliveries)

router.get('/getAvailableJobs', authenticate, getAvailableJobs)

router.get('/getTheJobDetails/:deliveryId', authenticate, getJobDetail)

router.get('/getOneDriver', authenticate,  getOneDriver)







module.exports = router