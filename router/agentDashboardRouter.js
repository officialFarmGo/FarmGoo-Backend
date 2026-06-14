const router = require('express').Router()


const {agentDashboardOverview, myFarmersOverview, getAgentWallet, getSingleAgentDelivery, getAllAgentDeliveries} = require('../controller/agentDashboardOverview')

const {authenticate} = require('../middleWare/auth')

router.get('/agentBoard', authenticate, agentDashboardOverview)

router.get('/agentsFarmersOverview', authenticate, myFarmersOverview)

router.get('/agentWallet', authenticate, getAgentWallet)

router.get('/trackdelivery/:deliveryId', authenticate, getSingleAgentDelivery)

router.get('/getAlldeliveries', authenticate, getAllAgentDeliveries)





module.exports = router