const router = require('express').Router()

const {createFarmer, verifyOtp, Farmlogin, forgetPassword, resetPassword, resendOtpforFarmers, getProfileDetails} = require('../controller/farmController')

const {signUpValidator, verifyOtpValidator, resetPasswordValidator, resendOTPValidator} = require('../middleWare/onBValidations')

const {authenticate} = require('../middleWare/auth')

router.post('/signUp', signUpValidator, createFarmer )

router.post('/verify', verifyOtpValidator, verifyOtp )

router.post('/farmLog', Farmlogin)

router.post('/forget-Password', forgetPassword)

router.post('/reset-Password', resetPasswordValidator, resetPassword)

router.post('/resendOtp', resendOTPValidator, resendOtpforFarmers)

router.get('/profileFill', authenticate, getProfileDetails)






module.exports = router

