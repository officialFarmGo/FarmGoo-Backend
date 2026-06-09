const router = require('express').Router()

const {createKyc} = require('../controller/driverKYcCont')

const {upload} = require('../middleWare/multer')

const {authenticate} = require('../middleWare/auth')


router.post('/createKyc/:driverid', upload.fields([{name:'driversLicense'},{name: 'vehiclePhoto'}, {name: 'VehiclePapers'}]), createKyc )



module.exports = router