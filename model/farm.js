const mongoose = require('mongoose')


const farmSchema = new mongoose.Schema({
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
        unique: true
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
    }

},  {timestamps: true})

const farmModel = mongoose.model('farmers', farmSchema)
module.exports = farmModel



