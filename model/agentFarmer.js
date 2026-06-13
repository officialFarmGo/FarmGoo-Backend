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
        required: true
    },
    farmLocation: {
        type: String,
        trim: true,
        required: true
    }
})

const agentFarmerModel = mongoose.model('agentFarmer', agentFarmerSchema)

module.exports = agentFarmerModel