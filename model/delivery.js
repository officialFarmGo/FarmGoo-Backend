const mongoose = require('mongoose')


const deliverySchema = new mongoose.Schema({
    productType: {
        type: String,
        required: true
    },
    quantity:{
        type: Number,
        required: true
    },
    weight: {
        type: String,
        enum: ["Kg", "Tons", "Bags"],
        default: "Kg"
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
    pickupSchedule:{
        date:{
            type: Date
        },
        time: {
            type: String
        }
    },
    vehicleType: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'vehicletype' 
    },
    status: {
    type: String,
    enum: ["Pending", "Accepted", "In Transit", "Delivered"],
    default: "Pending"
}
},  {timestamps: true})

deliveryModel = mongoose.model('deliverys', deliverySchema)

module.exports = deliveryModel



