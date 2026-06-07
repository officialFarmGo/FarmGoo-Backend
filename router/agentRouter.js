const router = require("express").Router();


const {createAgent, agentLogin, resendOtpforAgents, forgetPassword, resetPassword, verifyOtp} = require('../controller/agentController')

const {signUpValidator, verifyOtpValidator, resetPasswordValidator, resendOTPValidator} = require('../middleWare/onBValidations')

const {authenticate} = require('../middleWare/auth')

router.post('/signUp', signUpValidator, createAgent )

router.post('/verify', verifyOtpValidator, verifyOtp )

router.post('/agentLogin', agentLogin)

router.post('/forget-Password', forgetPassword)

router.post('/reset-Password', resetPasswordValidator, resetPassword)

router.post('/resendOtp', resendOTPValidator, resendOtpforAgents)

module.exports = router;