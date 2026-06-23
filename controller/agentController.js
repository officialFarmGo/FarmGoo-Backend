const agentModel = require('../model/agent')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const otpGenerator = require('otp-generator')
const brevo = require('../utils/brevo')
const {signUpOtpTemplateForAgents, resendOtpTemplateForAgents, resetPasswordSuccessfulTemplateForAgent, forgetPasswordTemplateForAgent } = require('../utils/agentEmailTemp')   
const agentWalletModel = require('../model/agentWallet')

exports.createAgent = async(req, res, next) =>{
    try{
        const {firstName, lastName, phoneNumber, email , townOrVillage, password} = req.body

        const checkEmail = await agentModel.findOne({email})
          if(checkEmail){
                return next({
                message: "Email already exists",
                 statusCode: 400
            });
        }

        const checkPhone = await agentModel.findOne({phoneNumber})
                if(checkPhone){
                    return next({
                        message: "Phone number already exists",
                         statusCode: 400
                    });
                }
                    

     const OTP = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

     const expiresAt = new Date(Date.now() + 1000 * 60 * 10)
     

     const salt = await bcrypt.genSalt(10);
     const hashPassword = await bcrypt.hash(password, salt)

        
        
        const agents = new agentModel({
            firstName, 
            lastName,
            phoneNumber, 
            email,
            townOrVillage,
            password: hashPassword,
            otp: OTP,
            otpExpiresAt:expiresAt
        }  )

        console.log(agents.otp)

        await agents.save()


        await brevo(agents.email, agents.firstName,  OTP, signUpOtpTemplateForAgents(agents.firstName, OTP))
        console.log(brevo)  
        

        res.status(201).json({
            message: 'successfully created an agent.',
            data: {
                id: agents._id,
                firstName: agents.firstName,
                lastName: agents.lastName,
                email: agents.email,
                phoneNumber: agents.phoneNumber,
                townOrVillage: agents.townOrVillage,
                isVerified: agents.isVerified,
                kycVerified: agents.kycVerified
            }
        })

    }
    catch(error){
        console.log(error.message)
        next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.verifyOtp = async(req, res, next) =>{
    try{
        const {email, otp} = req.body
        const checkEmail = await agentModel.findOne({email})

        if(!checkEmail){
            return next({
                message: 'invalid email address',
                statusCode: 404
            })
        }

        if(Date.now() > checkEmail.otpExpiresAt ){
            return next({
                message: 'invalid OTP',
                statusCode: 404
            })
    
        }
        if(checkEmail.otp !== otp){
            return next({
                message: 'invalid OTP',
                statusCode: 404
            })
            

        }
        //verify the email
        checkEmail.isVerified = true

         checkEmail.otp = null
        checkEmail.otpExpiresAt = null
        await checkEmail.save()


       const existingWallet = await agentWalletModel.findOne({ agent: checkEmail._id })
       if(!existingWallet) {
           await agentWalletModel.create({ agent: checkEmail._id })
       }    

        const data = agentModel({
            email,
            isVerified: checkEmail.isVerified
        })

        res.status(200).json({
            message: 'successfully verified Email',
            data
        })


    }
    catch(error){
        console.log(error.message)
        next({
            message: error.message,
            statusCode: 500
        })

    }
}

exports.agentLogin = async(req, res, next) =>{
    try{

        const {emailOrPhone, password} = req.body
        const user = await agentModel.findOne({
            $or: [
                {email: emailOrPhone},
                {phoneNumber: emailOrPhone}
            ]
        })
        if(!user){
            return next({
                message: 'user not found',
                statusCode: 404
            })
        
        }
        if(user.isVerified == false){
            return next({
                message: 'please verify your email',
                statusCode: 404
            })
        
        }


        const checkPassword = await bcrypt.compare(password, user.password)
        if(!checkPassword){
            return next({
                message: 'invalid Credentials',
                statusCode: 404
            })
        
        }

        const token = jwt.sign(
            {id: user._id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        );

        res.status(200).json({
            message: 'Login Successful',
            token,
            kycVerified: user.kycVerified
        })

    }
    catch(error){
        console.log(error.message)
         return next({
                message: 'invalid Credentials',
                statusCode: 500
            })
    }
}

exports.resendOtpforAgents = async(req, res, next) =>{
    try{
        const {email} = req.body
        const user = await agentModel.findOne({email: email.toLowerCase()})

        if(!user){
             return next({
                message: 'invalid Email',
                statusCode: 404
            })
        
        }

     const OTP = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
     const expiresAt = new Date(Date.now() + 1000 * 60 * 10)

     user.otpExpiresAt = expiresAt

     user.otp = OTP;
     await user.save()

     

        await brevo(user.email, user.firstName, OTP, resendOtpTemplateForAgents(user.firstName, OTP))

        res.status(200).json({
            message: 'OTP Sent successfully'
        })


    }
    catch(error){
         return next({
                message: error.message,
                statusCode: 500
            })
        
    }
}


exports.forgetPassword = async(req, res, next) => {
    try{
        const {emailOrPhone} = req.body
        const user = await agentModel.findOne({
            $or: [
                {email: emailOrPhone},
                {phoneNumber: emailOrPhone}
            ]
        })

        if(!user){
             return next({
                message: 'invalid email address',
                statusCode: 404
            })
        
        }

     const OTP = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
     user.otp = OTP
     const expiresAt = new Date(Date.now() + 1000 * 60 * 10)
     user.otpExpiresAt = expiresAt
     await user.save()
    
     const data  = {
        name: user.firstName,
        otp: user.otp
     }

    await brevo(user.email, user.firstName, OTP, forgetPasswordTemplateForAgent(user.firstName, OTP))

    res.status(200).json({
        message: 'successfully forgotten password',
        data
    })

    }
    catch(error){
        console.log(error)
        return next({
                message: error.message,
                statusCode: 500
            })
        
    }
}

exports.resetPassword = async(req, res, next) =>{
    try{
        const {email, password} =  req.body

        const user = await agentModel.findOne({email: email.toLowerCase()})
        if(!user){
            return next({
                message: 'invalid email address',
                statusCode: 404
            })
        }

        const checkPassword = await bcrypt.compare(password, user.password)
        if(checkPassword){
            return next({
                message: 'please enter in a new password',
                statusCode: 404
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt)

        user.password = hashPassword
        await user.save()

        await brevo(user.email, user.firstName, null, resetPasswordSuccessfulTemplateForAgent(user.firstName))

        res.status(200).json({
            message: 'successfully reset password'
        })

    }
    catch(error){
        console.log(error)
         return next({
                message: error.message,
                statusCode: 500
            })
        

    }
}

