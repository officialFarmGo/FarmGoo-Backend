const mongoose = require('mongoose')


const deliverySchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'farmers',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'drivers',
    },
    totalFare: {
    type: Number,
    required: true 
    },
    commission: {
    type: Number,
    required: true 
    },
    productType: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    quantity:{
        type: Number,
        required: true
    },
    weight: {
        type: String,
        enum: ["kg", "tons", "bags"],
        lowercase: true,
        required: true
    },
    AddressOrpickUpLocation:{
        type: String,
        trim: true,
        required: true
    },
    landMarkToAddressForPickup:{
        type: String,
        trim: true,
        required: true
    },
    Destination: {
        type: String,
        trim: true,
        required: true
    },
    customersPhoneNumber: {
        type: String,
        trim: true,
        required: true
    },
    CustomersOtherNumber: {
         type: String,
        trim: true,
        required: true
    },
    customersName: {
         type: String,
        trim: true,
        required: true
    },
    trackingId: {
         type: String,
        trim: true,
        required: true
    },
    vehhicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'vehicletypes' 
    },
    status: {
    type: String,
    enum: ["Pending", "Accepted", "In Transit", "Delivered"],
    default: "Pending"
},
    PIN: {
        type: String,
        required: true
    },
    estimatedDuration: {
        type: String
    },
    rejectedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'drivers'
}]

},  {timestamps: true})

const deliveryModel = mongoose.model('deliverys', deliverySchema)

module.exports = deliveryModel



