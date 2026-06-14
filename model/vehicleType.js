const mongoose = require('mongoose')

const vehicleTypeSchema = new mongoose.Schema({
    vehicleType:{
        type: String,
        required: true
    },
    baseFare:{
        type: Number,
        required: true  
    },
    ratePerKm:{
        type: Number,
        required: true
    }
}, {timestamps: true})

vehicleModel =  mongoose.model('vehicletypes', vehicleTypeSchema)

module.exports = vehicleModel