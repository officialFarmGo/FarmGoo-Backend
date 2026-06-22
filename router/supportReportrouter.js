const router = require('express').Router()

const { createSupportReport, getMySupportReports } = require('../controller/Supportreportcont')
const { authenticate } = require('../middleWare/auth')

const {createMessage} = require('../controller/sendMesController')



router.post('/createReport', authenticate, createSupportReport)
router.get('/myReports', authenticate, getMySupportReports)

router.post('/sendUsAMessage', createMessage)

module.exports = router