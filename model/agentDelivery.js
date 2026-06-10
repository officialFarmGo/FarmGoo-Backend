const mongoose = require("mongoose");
const agentModel = require("./agent");

const agentdeliverySchema = new mongoose.Schema({
    agentid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "agents",
        required: true
    },
    selectFarmer: {
        type: String,
        required: true,
    },
    producetype: {
        type: String,
        required: true,
    },
    quaCheckDelivery: {
        type: String,
        required: true,
    },
    pickupLocation: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    customerDetails: {
        type: String,
        required: true,
    },
    customerDetails: {
        type: String,
        required: true,
    },
    pickupDate: {
        type: Date,
        required: true,
    },
    vehicleTYpe: { 
        type: String,
        required: true,
    },


});  

const agentdeliveryModel = mongoose.model('agentdelivery', agentdeliverySchema)

// module.exports

