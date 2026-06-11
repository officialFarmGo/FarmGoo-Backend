const mongoose = require('mongoose')

const farmTransSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'farmers',
        required: true
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'farmerWallet',
        required: true
    },
    delivery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'delivery'
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['Credit', 'Debit'],
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending Release', 'successful','completed', 'Failed'],
        default: 'Pending Release'
    }
}, { timestamps: true })

const farmTransModel = mongoose.model('farmTransaction', farmTransSchema)

module.exports = farmTransModel