const router = require('express').Router()

const {getFarmerNotifications, markAllAsRead, markOneAsRead, getagentNotifications, getDriversNotification} = require('../controller/notification')
const { authenticate } = require('../middleWare/auth')

router.get('/farmerNotification', authenticate, getFarmerNotifications)

router.get('/markAll', authenticate, markAllAsRead)

router.get('/markOne', authenticate, markOneAsRead)

router.get('/agentNotification', authenticate, getagentNotifications)

router.get('/getDriversNotification', authenticate, getDriversNotification)


module.exports = router