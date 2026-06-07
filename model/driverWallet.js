const mongoose = require('mongoose')

const driverWalletSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'drivers',
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

const driverWalletModel = mongoose.model('driverWallet', driverWalletSchema)

module.exports = driverWalletModel



