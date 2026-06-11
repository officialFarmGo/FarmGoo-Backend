const router = require('express').Router()


const {dashBoardOverview} = require('../controller/farmerDashboard')

const {authenticate} = require('../middleWare/auth')

router.get('/farmDash', authenticate, dashBoardOverview)

module.exports = router