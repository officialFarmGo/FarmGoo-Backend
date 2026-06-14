const mongoose = require('mongoose');


const agentFarmerSchema = new mongoose.Schema({
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agents',
        required: true  
    },
    farmerFullName: {
        type: String,
        trim: true,
        required: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    farmLocation: {
        type: String,
        trim: true,
        required: true
    },
    mainProduceType:{
        type: String,
        trim: true,
        required: true
    }
},{timestamps: true})

const agentFarmerModel = mongoose.model('agentFarmer', agentFarmerSchema)

module.exports = agentFarmerModel