const router = require('express').Router()

const {addBank, getBankList} = require('../controller/bankController')

const {authenticate} = require('../middleWare/auth')

router.post('/createBank', authenticate, addBank)

router.get('/banks', authenticate, getBankList)

module.exports = router
