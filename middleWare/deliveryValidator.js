const joi = require('joi')

exports.createDeliveryValidator = (req, res, next) => {
    const schema = joi.object({
        productType: joi.string().trim().required().messages({
            'any.required': 'Product type is required',
            'string.empty': 'Product type cannot be empty'
        }),
        quantity: joi.number().required().messages({
            'any.required': 'Quantity is required',
            'number.base': 'Quantity must be a number'
        }),
        weight: joi.string().valid('kg', 'tons', 'bags').required().messages({
            'any.required': 'Weight is required',
            'any.only': 'Weight must be kg, tons or bags'
        }),
        AddressOrpickUpLocation: joi.string().trim().required().messages({
            'any.required': 'Pickup location is required',
            'string.empty': 'Pickup location cannot be empty'
        }),
        landMarkToAddressForPickup: joi.string().trim().required().messages({
            'any.required': 'Landmark is required',
            'string.empty': 'Landmark cannot be empty'
        }),
        Destination: joi.string().trim().required().messages({
            'any.required': 'Destination is required',
            'string.empty': 'Destination cannot be empty'
        }),
        customersPhoneNumber: joi.string().pattern(/^\d{11}$/).required().messages({
            'any.required': 'Customer phone number is required',
            'string.empty': 'Customer phone number cannot be empty',
            'string.pattern.base': 'Customer phone number must be 11 digits'
        }),
        CustomersOtherNumber: joi.string().pattern(/^\d{11}$/).required().messages({
            'any.required': 'Customer other number is required',
            'string.empty': 'Customer other number cannot be empty',
            'string.pattern.base': 'Customer other number must be 11 digits'
        }),
        pickupSchedule: joi.object({
            date: joi.date().messages({
                'date.base': 'Pickup date must be a valid date'
            }),
            time: joi.string().messages({
                'string.empty': 'Pickup time cannot be empty'
            })
        })
    })

    const { error } = schema.validate(req.body)
    if(error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}

exports.acceptDeliveryValidator = (req, res, next) => {
    const schema = joi.object({
        deliveryId: joi.string().required().messages({
            'any.required': 'Delivery ID is required',
            'string.empty': 'Delivery ID cannot be empty'
        })
    })

    const { error } = schema.validate(req.params)
    if(error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}

exports.completeDeliveryValidator = (req, res, next) => {
    const schema = joi.object({
        PIN: joi.string().length(4).pattern(/^\d{4}$/).required().messages({
            'any.required': 'PIN is required',
            'string.empty': 'PIN cannot be empty',
            'string.length': 'PIN must be exactly 4 digits',
            'string.pattern.base': 'PIN must contain only numbers'
        })
    })

    const { error } = schema.validate(req.body)
    if(error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}