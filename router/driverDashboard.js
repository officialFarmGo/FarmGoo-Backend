const router = require('express').Router()


const {driverDashboard} = require('../controller/driverDashboard')

const {authenticate} = require('../middleWare/auth')

router.get('/driverDashBoard', authenticate, driverDashboard)





module.exports = router