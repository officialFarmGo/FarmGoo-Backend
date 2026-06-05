const mongoose = require('mongoose')

const paymentSchema = mongoose.Schema({
        owner: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'ownerType', 
        required: true
    },
    ownerType: {
        type: String,
        enum: ['farmers', 'drivers', 'agents'],
        required: true
    },
    reference: {
        type: String,
        required: true,
        unique: true
    },
    amount:{
        type: Number,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['processing', 'success', 'failed', 'abandoned'],
        default: 'processing'

    }


}, {timestamps: true})

const paymentModel = mongoose.model('payment', paymentSchema)

module.exports = paymentModel