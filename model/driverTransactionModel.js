const mongoose = require('mongoose')

const driverTransSChema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'drivers',
        required: true
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'driverWallets',
        required: true
    },
    delivery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'deliverys'
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
        enum: ['Pending', 'Successful', 'Failed'],
        default: 'Pending'
    }
}, { timestamps: true })

const driveTransModel = mongoose.model('driverTransaction', driverTransSChema)

module.exports = driveTransModel