const joi = require('joi');
const agentdeliveryModel = require("../model/agentDelivery");
const agentModel = require("../model/agent");

exports.validateDelivery = (req, res, next) => {
    const deliverySchema = joi.object({
        selectFarmer: joi.string().required().pattern(/^[A-Za-z\s]+$/).messages({
            'any.required': 'Select Farmer is required',
            'string.empty': 'Select Farmer cannot be empty',
            'string.pattern.base': 'Select Farmer must contain only letters and spaces'
        }),
        producetype: joi.string().required().pattern(/^[A-Za-z\s]+$/).messages({
            'any.required': 'Product Type is required',
            'string.empty': 'Product Type cannot be empty',
            'string.pattern.base': 'Product Type must contain only letters and spaces'
        })
    });
        qualityCheckDelivery: joi.string().required().pattern(/^[A-Za-z\s]+$/).messages({
            'any.required': 'Quality Check Delivery is required',
            'string.empty': 'Quality Check Delivery cannot be empty',
            'string.pattern.base': 'Quality Check Delivery must contain only letters and spaces'
        })
    };
    pickupLocation: joi.string().required().pattern(/^[A-Za-z\s]+$/).messages({
        'any.required': 'Pickup Location is required',
        'string.empty': 'Pickup Location cannot be empty',
        'string.pattern.base': 'Pickup Location must contain only letters and spaces'
    })
      pickupDate: joi.date().required().messages({
        'any.required': 'Pickup Date is required',
        'date.base': 'Pickup Date must be a valid date'
    })
        destination: joi.string().required().pattern(/^[A-Za-z\s]+$/).messages({
        'any.required': 'Destination is required',
        'string.empty': 'Destination cannot be empty',
        'string.pattern.base': 'Destination must contain only letters and spaces'
    })
        customerDetails: joi.string().required().pattern(/^[A-Za-z\s]+$/).messages({
        'any.required': 'Customer Details is required',
        'string.empty': 'Customer Details cannot be empty',
        'string.pattern.base': 'Customer Details must contain only letters and spaces'
    })
        vehicleType: joi.string().required().pattern(/^[A-Za-z\s]+$/).messages({
        'any.required': 'Vehicle Type is required',
        'string.empty': 'Vehicle Type cannot be empty',
        'string.pattern.base': 'Vehicle Type must contain only letters and spaces'
    })
       agentid: joi.string().required().messages({
        'any.required': 'Agent ID is required',
        'string.empty': 'Agent ID cannot be empty'
    })