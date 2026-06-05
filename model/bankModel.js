const { types } = require('joi')
const mongoose = require('mongoose')

const bankSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'farmers'
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agents'
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'drivers'
    },
    bankName: {
        type: String,
        required: true,
        uppercase: true
    },
    AccountName: {
        type: String,
        required: true,
        uppercase: true
    },
    AccountNumber: {
        type: String,
        required: true
    }

})

const bankModel = mongoose.model('banks', bankSchema)
module.exports = bankModel

