const router = require('express').Router()


const {driverDashboard, getDriverWallet, getDriverDeliveries, getAvailableJobs, getJobDetail, getOneDriver, getDriverEarnings} = require('../controller/driverDashboard')

const {authenticate} = require('../middleWare/auth')

router.get('/driverDashBoard', authenticate, driverDashboard)

router.get('/driverWallet', authenticate, getDriverWallet)

router.get('/driverDeliveries', authenticate, getDriverDeliveries)

router.get('/getAvailableJobs', authenticate, getAvailableJobs)

router.get('/getTheJobDetails/:deliveryId', authenticate, getJobDetail)

router.get('/getOneDriver', authenticate,  getOneDriver)

router.get('/getDriverEarnings', authenticate, getDriverEarnings)







module.exports = router