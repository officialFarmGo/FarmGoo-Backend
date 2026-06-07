const driverModel = require('../model/driver')
const brevo = require('../utils/brevo')
const {signUpOtpTemplateForDrivers, resetPasswordSuccessfulTemplateForDriver, forgetPasswordTemplateForDriver, resendOtpTemplateForDrivers} = require('../utils/driverEmailtemp')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.createDriver = async(req, res, next) =>{
    try{
        const {firstName, lastName, phoneNumber, email , townOrVillage, password} = req.body

        const user = await driverModel.find({email})
        if(user == user.email){
            return next({
                message: 'invalid email',
                statusCode: 404
            })
        }

     const OTP = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
     

     const salt = await bcrypt.genSalt(10);
     const hashPassword = await bcrypt.hash(password, salt)

        
        
        const driver = new driverModel({
            firstName, 
            lastName,
            phoneNumber, 
            email,
            townOrVillage,
            password: hashPassword,
            otp: OTP,
        }  )

        console.log(driver.otp)

        await driver.save()

        const viewed = new driverModel({
            firstName, 
            lastName,
            phoneNumber, 
            email,
            townOrVillage,
            password: hashPassword,
            otp: OTP
            

        })

        if(email == null){
            const duty = new driverModel({
                firstName,
                lastName,
                phoneNumber,
                townOrVillage,
                password

            })

        }

        await brevo(driver.email, driver.firstName,  OTP, signUpOtpTemplateForDrivers(driver.firstName, OTP))
        console.log(brevo)  
        

        res.status(201).json({
            message: 'successfully created driver.',
            data: viewed
        })

    }
    catch(error){
        console.log(error.message)
        next({
            message: 'something went wrong',
            statusCode: 500
        })
    }
}

exports.verifyOtpforDriver = async(req, res, next) =>{
    try{
        const {email, otp} = req.body
        const checkEmail = await driverModel.findOne({email})

        if(!checkEmail){
            return next({
                message: 'invalid email address',
                statusCode: 404
            })
        }

        if(Date.now() > checkEmail.otpExpiresAt){
            return next({
                message: 'invalid OTP'
            })
    
        }
         if(checkEmail.otp !== otp){
            return next({
                message: 'invalid OTP'
            })
         }
        //verify the email
        checkEmail.isVerified = true


        checkEmail.otp = null
        checkEmail.otpExpiresAt = null

        await checkEmail.save()

        const data = driverModel({
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
            message: 'something went wrong',
            statusCode: 500
        })

    }
}

exports.driverLogin = async(req, res, next) =>{
    try{

        const {emailOrPhone, password} = req.body
        const user = await driverModel.findOne({
            $or: [
                {email: emailOrPhone},
                {phoneNumber: emailOrPhone}
            ]
        })
        if(!user){
            return next({
                message: 'invalid email',
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
            user
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

     const expiresAt = new Date(Date.now() + 1000 * 60 * 5)

     user.otp = OTP;
     user.otpExpiresAt = expiresAt

     await user.save()
     
  

        await brevo(user.email, user.firstName, OTP, resendOtpTemplateForDrivers(user.firstName, OTP))

        res.status(200).json({
            message: 'OTP Sent successfully'
        })


    }
    catch(error){
         return next({
                message: 'something went wrong',
                statusCode: 500
            })
        
    }
}


exports.forgetPasswordDriv = async(req, res, next) => {
    try{
        const {emailOrPhone} = req.body
        const user = await driverModel.findOne({
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
     const expiresAt = new Date(Date.now() + 1000 * 60 * 5)
     user.otpExpiresAt = expiresAt
     await user.save()
    
     const data  = {
        name: user.firstName,
        otp: user.otp
     }

    await brevo(user.email, user.firstName, OTP, forgetPasswordTemplateForDriver(user.firstName, OTP))

    res.status(200).json({
        message: 'successfully forgotten password',
        data
    })

    }
    catch(error){
        console.log(error)
        return next({
                message: 'something went wrong',
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
                message: 'please enter in a new password',
                statusCode: 404
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt)

        user.password = hashPassword
        await user.save()

        await brevo(user.email, user.firstName, null, resetPasswordSuccessfulTemplateForDriver(user.firstName))

        res.status(200).json({
            message: 'successfully reset password'
        })

    }
    catch(error){
        console.log(error)
         return next({
                message: 'something went wrong',
                statusCode: 500
            })
        

    }
}
