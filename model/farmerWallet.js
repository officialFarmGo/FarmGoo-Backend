const mongoose = require('mongoose')

const farmWalletSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'farmers',
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

const farmWalletModel = mongoose.model('farmWallet', farmWalletSchema)

module.exports = farmWalletModel



