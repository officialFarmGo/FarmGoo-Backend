const mongoose = require('mongoose')


const driverSchema = new mongoose.Schema({
    firstName: {
        type: String, 
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    townOrVillage:{
        type: String, 
        trim: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    otp: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
     otpExpiresAt: {
        type: Date,
        default:  () => new Date(Date.now() + (1000 * 5 * 60))
    },
    kycVerified: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true  
    },
    role: {
        type: String, 
        default: 'driver'
    },
    isAvailable:{
        type: Boolean,
        default: true
    }


}, {timestamps: true})

const driverModel =  mongoose.model('drivers', driverSchema)
module.exports = driverModel