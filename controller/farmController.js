const farmModel = require('../model/farm')
const brevo = require('../utils/brevo')
const {signUpOtpTemplateforFarmers, resendOtpTemplateForFarmers, forgetPasswordTemplateforFarmer, resetPasswordSuccessfulTemplateforFarmer } = require('../utils/emailTemplate')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const farmWalletModel = require('../model/farmerWallet')

exports.createFarmer = async(req, res, next) =>{
    try{
        const {firstName, lastName, phoneNumber, email , townOrVillage, password} = req.body

        const checkEmail = await farmModel.find({email})
        if(checkEmail == checkEmail.email){
            return next({
                message: 'invalid email',
                statusCode: 404
            })
        }

     const OTP = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

     const expiresAt = new Date(Date.now() + 1000 * 60 * 5)
     

     const salt = await bcrypt.genSalt(10);
     const hashPassword = await bcrypt.hash(password, salt)

        
        
        const farmers = new farmModel({
            firstName, 
            lastName,
            phoneNumber, 
            email,
            townOrVillage,
            password: hashPassword,
            otp: OTP,
            otpExpiresAt:expiresAt
        }  )

        console.log(farmers.otp)

        await farmers.save()

        const viewed = new farmModel({
            firstName, 
            lastName,
            phoneNumber, 
            email,
            townOrVillage,
            password: hashPassword,
            otp: OTP
            

        })

        if(email == null){
            const duty = new farmModel({
                firstName,
                lastName,
                phoneNumber,
                townOrVillage,
                password

            })

        }

        await brevo(farmers.email, farmers.firstName,  OTP, signUpOtpTemplateforFarmers(farmers.firstName, OTP))
        console.log(brevo)  
        

        res.status(201).json({
            message: 'successfully created farmers.',
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

exports.verifyOtp = async(req, res, next) =>{
    try{
        const {email, otp} = req.body
        const checkEmail = await farmModel.findOne({email})

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


       const existingWallet = await farmWalletModel.findOne({ farmer: checkEmail._id })
       if(!existingWallet) {
           await farmWalletModel.create({ farmer: checkEmail._id })
       }    

        const data = farmModel({
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

exports.Farmlogin = async(req, res, next) =>{
    try{

        const {emailOrPhone, password} = req.body
        const user = await farmModel.findOne({
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

exports.resendOtpforFarmers = async(req, res, next) =>{
    try{
        const {email} = req.body
        const user = await farmModel.findOne({email: email.toLowerCase()})

        if(!user){
             return next({
                message: 'invalid Email',
                statusCode: 404
            })
        
        }

     const OTP = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
     const expiresAt = new Date(Date.now() + 1000 * 60 * 5)

     user.otpExpiresAt = expiresAt

     user.otp = OTP;
     await user.save()

     

        await brevo(user.email, user.firstName, OTP, resendOtpTemplateForFarmers(user.firstName, OTP))

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


exports.forgetPassword = async(req, res, next) => {
    try{
        const {emailOrPhone} = req.body
        const user = await farmModel.findOne({
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

    await brevo(user.email, user.firstName, OTP, forgetPasswordTemplateforFarmer(user.firstName, OTP))

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

exports.resetPassword = async(req, res, next) =>{
    try{
        const {email, password} =  req.body

        const user = await farmModel.findOne({email: email.toLowerCase()})
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

        await brevo(user.email, user.firstName, null, resetPasswordSuccessfulTemplateforFarmer(user.firstName))

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


exports.getProfileDetails = async(req, res, next) =>{
    try{
    const {id} = req.user

    const user = await farmModel.findById(id).select('firstName lastName email phoneNumber')
    if(!user){
        return next({
            message: 'user not found',
            statusCode: 404
        })
    }

    res.status(200).json({
        message: 'success',
        data: user
    })
}

catch(error){
    console.log(error.message)
   return next({
        message:'something went wrong',
        statusCode: 500
    })
    
}

}


exports.completeProfile = async(req, res, next) =>{
    try{
        const {} = req.body

    }
    catch(error){
        return next({
            message: 'something went wrong',
            statusCode: 500
        })
    }
}