const joi = require('joi');


exports.createAgentDelivery = (req, res, next) => {
    const schema = joi.object({
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
