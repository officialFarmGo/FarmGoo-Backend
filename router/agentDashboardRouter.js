const router = require('express').Router()


const {agentDashboardOverview, myFarmersOverview} = require('../controller/agentDashboardOverview')

const {authenticate} = require('../middleWare/auth')

router.get('/agentBoard', authenticate, agentDashboardOverview)

router.get('/agentsFarmersOverview', authenticate, myFarmersOverview)


module.exports = router