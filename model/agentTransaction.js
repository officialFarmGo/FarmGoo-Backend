const mongoose = require('mongoose')

const agentTransactionSchema = new mongoose.Schema({
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agents',
        required: true
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agentWallets',
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

const agentTransModel = mongoose.model('agentTransaction', agentTransactionSchema)

module.exports = agentTransModel