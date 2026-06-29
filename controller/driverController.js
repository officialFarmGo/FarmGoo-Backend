const driverModel = require('../model/driver')
const brevo = require('../utils/brevo')
const {signUpOtpTemplateForDrivers, resetPasswordSuccessfulTemplateForDriver, forgetPasswordTemplateForDriver, resendOtpTemplateForDrivers} = require('../utils/driverEmailtemp')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const driverWalletModel = require('../model/driverWallet')

exports.createDriver = async(req, res, next) =>{
    try{
        const {firstName, lastName, phoneNumber, email , townOrVillage, password} = req.body

        const user = await driverModel.findOne({ email: email.toLowerCase() });
        if(user){
                return next({
                message: "Email already exists",
                 statusCode: 400
            });
}


     const checkPhone = await driverModel.findOne({phoneNumber})
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

        
        
        const driver = new driverModel({
            firstName, 
            lastName,
            phoneNumber, 
            email: email.toLowerCase(),
            townOrVillage,
            password: hashPassword,
            otp: OTP,
            otpExpiresAt:expiresAt
        }  )

        console.log(driver.otp)

        await driver.save()

       

        await brevo(driver.email, driver.firstName,  OTP, signUpOtpTemplateForDrivers(driver.firstName, OTP))
        console.log(brevo)  
        

        res.status(201).json({
            message: 'successfully created driver.',
            data: {
                id: driver._id,
                firstName: driver.firstName,
                lastName: driver.lastName,
                email: driver.email,
                phoneNumber: driver.phoneNumber,
                townOrVillage: driver.townOrVillage,
                isVerified: driver.isVerified,
                kycVerified: driver.kycVerified
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

exports.verifyOtpforDriver = async(req, res, next) =>{
    try{
        const {email, otp} = req.body
        const checkEmail = await driverModel.findOne({email: email.toLowerCase()})

        if(!checkEmail){
            return next({
                message: 'invalid email address',
                statusCode: 404
            })
        }

        if(Date.now() > checkEmail.otpExpiresAt){
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

        const existingWallet = await driverWalletModel.findOne({ driver: checkEmail._id })
               if(!existingWallet) {
                   await driverWalletModel.create({ driver: checkEmail._id })
               } 

        const data = {
            email,
            isVerified: checkEmail.isVerified
        }

        res.status(200).json({
            message: 'successfully verified your Email, you can now log in',
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

exports.driverLogin = async(req, res, next) =>{
    try{

        const {emailOrPhone, password} = req.body
        const user = await driverModel.findOne({
            $or: [
                {email: emailOrPhone.toLowerCase()},
                {phoneNumber: emailOrPhone}
            ]
        })
        if(!user){
            return next({
                message: 'Driver not found',
                statusCode: 404
            })
        
        }
        if(user.isVerified == false){
            return next({
                message: 'please verify your email before logging in',
                statusCode: 404
            })
        
        }


        const checkPassword = await bcrypt.compare(password, user.password)
        if(!checkPassword){
            return next({
                message: 'invalid Credentials',
                statusCode: 401
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
                statusCode: 401
            })
    }
}

exports.resendOtpforDriver = async(req, res, next) =>{
    try{
        const {email} = req.body
        const user = await driverModel.findOne({email: email.toLowerCase()})

        if(!user){
             return next({
                message: 'invalid Email',
                statusCode: 404
            })
        
        }

     const OTP = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

     const expiresAt = new Date(Date.now() + 1000 * 60 * 10)

     user.otp = OTP;
     user.otpExpiresAt = expiresAt

     await user.save()
     
  

        await brevo(user.email, user.firstName, OTP, resendOtpTemplateForDrivers(user.firstName, OTP))

        res.status(200).json({
            message: 'A new OTP has been sent to your email address'
        })


    }
    catch(error){
         return next({
                message: error.message,
                statusCode: 500
            })
        
    }
}


exports.forgetPasswordDriv = async(req, res, next) => {
    try{
        const {emailOrPhone} = req.body
        const user = await driverModel.findOne({
            $or: [
                {email: emailOrPhone.toLowerCase()},
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
     }

    await brevo(user.email, user.firstName, OTP, forgetPasswordTemplateForDriver(user.firstName, OTP))

    res.status(200).json({
        message: 'An OTP has been sent to your email address',
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

exports.resetPasswordDriv = async(req, res, next) =>{
    try{
        const {email, password} =  req.body

        const user = await driverModel.findOne({email: email.toLowerCase()})
        if(!user){
            return next({
                message: 'invalid email address',
                statusCode: 404
            })
        }

        const checkPassword = await bcrypt.compare(password, user.password)
        if(checkPassword){
            return next({
                message: 'new password cannot be the same as your old password',
                statusCode: 404
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt)

        user.password = hashPassword
        await user.save()

        await brevo(user.email, user.firstName, null, resetPasswordSuccessfulTemplateForDriver(user.firstName))

        res.status(200).json({
            message: 'Password has been reset successfully. You can now log in with your new password.'
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
