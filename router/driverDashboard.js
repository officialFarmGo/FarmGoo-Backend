const router = require('express').Router()


const {driverDashboard, getDriverWallet} = require('../controller/driverDashboard')

const {authenticate} = require('../middleWare/auth')

router.get('/driverDashBoard', authenticate, driverDashboard)

router.get('/driverWallet', authenticate, getDriverWallet)





module.exports = router