const router = require('express').Router()


const {driverDashboard, getDriverWallet, getDriverDeliveries, getAvailableJobs, getJobDetail, getOneDriver, getDriverEarnings, updateDriverDashbard} = require('../controller/driverDashboard')

const {upload, uploadToMemory } = require('../middleWare/multer')


const {authenticate} = require('../middleWare/auth')

router.get('/driverDashBoard', authenticate, driverDashboard)

router.get('/driverWallet', authenticate, getDriverWallet)

router.get('/driverDeliveries', authenticate, getDriverDeliveries)

router.get('/getAvailableJobs', authenticate, getAvailableJobs)

router.get('/getTheJobDetails/:deliveryId', authenticate, getJobDetail)

router.get('/getOneDriver', authenticate,  getOneDriver)

router.get('/getDriverEarnings', authenticate, getDriverEarnings)

router.patch('/updateProfile', authenticate, upload.fields([{name:'profilePicture'}]), updateDriverDashbard)







module.exports = router