const router = require('express').Router()

const { createSupportReport, getMySupportReports } = require('../controller/Supportreportcont')
const { authenticate } = require('../middleWare/auth')



router.post('/createReport', authenticate, createSupportReport)
router.get('/myReports', authenticate, getMySupportReports)

module.exports = router