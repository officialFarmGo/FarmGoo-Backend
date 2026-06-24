const joi = require('joi');


exports.createAgentDeliveryValidation = (req, res, next) => {
    const schema = joi.object({
        agentFarmerId: joi.string().required().messages({
            'any.required': 'Farmer selection is required',
            'string.empty': 'Farmer selection cannot be empty'
        }),
        produceType: joi.string().trim().required().messages({
            'any.required': 'Produce type is required',
            'string.empty': 'Produce type cannot be empty'
        }),
        quantity: joi.string().trim().required().messages({
            'any.required': 'Quantity is required',
            'string.empty': 'Quantity cannot be empty'
        }),
        pickupLocation: joi.string().trim().required().messages({
            'any.required': 'Pickup location is required',
            'string.empty': 'Pickup location cannot be empty'
        }),
        Destination: joi.string().trim().required().messages({
            'any.required': 'Destination is required',
            'string.empty': 'Destination cannot be empty'
        }),
        customersDetails: joi.string().pattern(/^\d{11}$/).required().messages({
            'any.required': 'Customer phone number is required',
            'string.empty': 'Customer phone number cannot be empty',
            'string.pattern.base': 'Customer phone number must be 11 digits'
        }),
        customersName: joi.string().required().messages({
            'any.required': 'Customer Name is required',
            'string.empty': 'Customer Name cannot be empty'
        }),
    })

    const { error } = schema.validate(req.body)
    if(error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}


exports.createAgentKycValidation = (req, res, next) =>{
     const schema = joi.object({
        state: joi.string().trim().required().messages({
            'any.required': 'Agents State is required',
            'string.empty': 'Agents State cannot be empty'
        }),
        residentialAddress: joi.string().trim().required().messages({
            'any.required': 'Agents Residential Address is required',
            'string.empty': 'Agents Residential Address cannot be empty'
        }),
        kinsFirstName: joi.string().trim().required().messages({
            'any.required': 'Ageents kins first Name location is required',
            'string.empty': 'Ageents kins first Name location cannot be empty'
        }),
        kinsLastName: joi.string().trim().required().messages({
            'any.required': 'Agents kins last Name is required',
            'string.empty': 'Agents kins last Name cannot be empty'
        }),
        kinsPhoneNumber: joi.string().pattern(/^\d{11}$/).required().messages({
            'any.required': 'Agents kins phone number is required',
            'string.empty': 'Agents kins phone number cannot be empty',
            'string.pattern.base': 'Agents kins phone number must be 11 digits'
        }),
        kinsEmail:joi.string().email().required().messages({
                    'string.email': 'Agents kins email must be valid',
                    "string.empty": "Agents kins email cannot be empty",
         }),
         kinsRelationship:joi.string().required().messages({
                    "string.empty": "Agents kins Relationship cannot be empty",
         }),
         kinsLgaOrTown:joi.string().trim().required().messages({
            'any.required': 'Agents kins last Name is required',
            'string.empty': 'Agents kins last Name cannot be empty'
        }),
                
    })

    const { error } = schema.validate(req.body)
    if(error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}