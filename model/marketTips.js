const mongoose = require('mongoose')

const marketTipsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

const marketTipsModel = mongoose.model('marketTips', marketTipsSchema)
module.exports = marketTipsModel