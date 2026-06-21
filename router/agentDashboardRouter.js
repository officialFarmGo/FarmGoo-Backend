const router = require('express').Router()


const {agentDashboardOverview, myFarmersOverview, getAgentWallet, getSingleAgentDelivery, getAllAgentDeliveries, updateProfile, getOneAgent} = require('../controller/agentDashboardOverview')

const {upload, uploadToMemory } = require('../middleWare/multer')


const {authenticate} = require('../middleWare/auth')

router.get('/agentBoard', authenticate, agentDashboardOverview)

router.get('/agentsFarmersOverview', authenticate, myFarmersOverview)

router.get('/agentWallet', authenticate, getAgentWallet)

router.get('/trackdelivery/:deliveryId', authenticate, getSingleAgentDelivery)

router.get('/getAlldeliveries', authenticate, getAllAgentDeliveries)

router.patch('/updateProfile', authenticate, upload.fields([{name:'profilePicture'}]), updateProfile)

router.get('/getOneAgent', authenticate, getOneAgent)





module.exports = router