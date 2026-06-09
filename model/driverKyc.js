const mongoose = require('mongoose')

const driKycSchema = new mongoose.Schema({
    driver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'drivers',
        required: true
    },
    driversLicense:{
        securedUrl: {
            type: String,
            trim: true
        },
        publicId: {
            type:String,
            trim: true
        }
    },
    vehiclePhoto: {
        securedUrl: {
            type: String,
            trim: true
        },
        publicId: {
            type:String,
            trim: true
        }
        
    },
    VehiclePapers:{
        securedUrl: {
            type: String,
            trim: true
        },
        publicId: {
            type:String,
            trim: true
        }
    },
    vehicleType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'vehicletype',
    required: true
    }
}, {timestamps: true})

const driverKycModel =  mongoose.model('driveKyc', driKycSchema)

module.exports = driverKycModel