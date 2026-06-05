const router = require('express').Router()

const {createDriver, driverLogin, resendOtpforDriver, resetPasswordDriv, verifyOtpforDriver, forgetPasswordDriv} = require('../controller/driverController')

const {signUpValidator, verifyOtpValidator, resetPasswordValidator, resendOTPValidator} = require('../middleWare/onBValidations')


router.post('/signUpDriver', signUpValidator, createDriver)

router.post('/verifyEmail', verifyOtpValidator, verifyOtpforDriver)


router.post('/driversLogin', driverLogin)

router.post('/forget-Password', forgetPasswordDriv)

router.post('/reset-Password', resetPasswordValidator, resetPasswordDriv)

router.post('/resendOtp', resendOTPValidator, resendOtpforDriver)




module.exports = router