const mongoose = require('mongoose')

const agentWalletSchema = new mongoose.Schema({
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agents',
        unique: true,
        required: true
    },
    availableBalance:{
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    escrowBalance: {
        type: Number,
        default: 0 
    }
    
},{timestamps: true})

const agentWalletModel = mongoose.model('agentWallet', agentWalletSchema)

module.exports = agentWalletModel



