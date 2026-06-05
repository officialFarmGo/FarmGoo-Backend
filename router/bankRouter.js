const router = require('express').Router()

const {addBank} = require('../controller/bankController')

const {authenticate} = require('../middleWare/auth')

router.post('/createBank', authenticate, addBank)

module.exports = router
