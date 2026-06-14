const router = require('express').Router()


const {agentDashboardOverview, myFarmersOverview, getAgentWallet} = require('../controller/agentDashboardOverview')

const {authenticate} = require('../middleWare/auth')

router.get('/agentBoard', authenticate, agentDashboardOverview)

router.get('/agentsFarmersOverview', authenticate, myFarmersOverview)

router.get('/agentWallet', authenticate, getAgentWallet)





module.exports = router