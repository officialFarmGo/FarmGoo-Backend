const router = require("express").Router();


const {createAgent, agentLogin, resendOtpforAgents, forgetPassword, resetPassword, verifyOtp} = require('../controller/agentController')

const {signUpValidator, verifyOtpValidator, resetPasswordValidator, resendOTPValidator, agentFarmerValidation} = require('../middleWare/onBValidations')

const {createAgentFarmer, getAllFarmersUnderAgent} = require('../controller/creatAgentFarmer')

const {authenticate} = require('../middleWare/auth')

router.post('/signUp', signUpValidator, createAgent )

router.post('/verify', verifyOtpValidator, verifyOtp )

router.post('/agentLogin', agentLogin)

router.post('/forget-Password', forgetPassword)

router.post('/reset-Password', resetPasswordValidator, resetPassword)

router.post('/resendOtp', resendOTPValidator, resendOtpforAgents)

router.post('/createAgentFarmer', authenticate, agentFarmerValidation, createAgentFarmer)

router.get('/getFarmersUnderAgent', authenticate, getAllFarmersUnderAgent)



module.exports = router;