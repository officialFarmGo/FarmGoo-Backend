const mongoose = require("mongoose");

const agentDeliverySchema = new mongoose.Schema({
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "agents",
        required: true
    },
    agentFarmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "agentFarmer",
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'drivers'
    },
    trackingId: {
        type: String,
        unique: true  
    },
    PIN: {
        type: String 
    },
    produceType: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    pickupLocation: {
        type: String,
        trim: true,
        required: true
    },
    Destination: {
        type: String,
        trim: true,
        required: true
    },
    customersDetails: {
        type: String,
        trim: true,
        required: true
    },
    customersName: {
         type: String,
        trim: true,
        required: true
    },
    vehicleType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vehicletypes',  
        required: true
    },
    totalFare: {
        type: Number  
    },
    commission: {
        type: Number  
    },
    amount: {
        type: Number 
    },
    estimatedDuration: {
        type: String  
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'In Transit', 'Delivered'],
        default: 'Pending'
    }
}, { timestamps: true })

const agentDeliveryModel = mongoose.model('agentDelivery', agentDeliverySchema)

module.exports = agentDeliveryModel