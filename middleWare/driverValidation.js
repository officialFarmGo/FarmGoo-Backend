const joi = require('joi')

exports.signUpValidator = (req, res, next) =>{
    const schema = joi.object({
        firstName: joi.string().trim().pattern(/^[A-Za-z]{4,}$/).required().messages({
            'any.required': "First Name is required",
            "string.empty": "First name cannot be empty",
            'string.pattern.base': "First name cannot contain numbers, or spaces and must be at least 4 characters",
        }), 
        lastName: joi.string().trim().pattern(/^[A-Za-z]{4,}$/).required().messages({
            'any.required': "Last Name is required",
            "string.empty": "Last name cannot be empty",
            'string.pattern.base': "Last name cannot contain numbers, or spaces and must be at least 4 characters",
        }), 
        email:joi.string().email().required().messages({
          'string.email': 'Email must be valid',
            "string.empty": "Email cannot be empty",
            'string.email': 'Email must be valid'
                }),
        phoneNumber: joi.string().pattern(/^\d{11}$/).required().messages({
            'any.required': 'Phone Number is required',
            'string.empty': 'phone Number cannot be empty',
            'string.pattern.base': 'phone number must contain 11 digits'
        }),
        townOrVillage: joi.string().trim().pattern(/^[A-Za-z\s]{4,}$/).required().messages({
            'any.required': "Town or Village is required",
            "string.empty": "Town or Village cannot be empty",
            'string.pattern.base': "Town or Village cannot contain numbers and must be at least 4 characters",
        }), 
        password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
            'any.required': 'Password is required',
            'string.empty': 'password cannot be empty',
            'string.pattern.base': 'password must be at least 8 letters long and must include at least 1 upper case and lower case'
        }),
        
    })

    const { error} = schema.validate(req.body);
    //console.log(error.details[0])
    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }


    next()
   
}

exports.verifyOtpValidator = (req, res, next) =>{
     const schema = joi.object({
    email:joi.string().email().required().messages({
            'any.required': 'email is required',
            'string.empty': 'email cannot be empty',
            'string.email': 'email must be valid'

        }),
        otp: joi.number().required().messages({
        'any.required': 'Otp is required',
        'number.base': 'Otp must be a number'
       })
   
    })
    const { error} = schema.validate(req.body);
    //console.log(error.details[0])
    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }


    next()
}
