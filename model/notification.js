const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
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
    title: {
        type: String,
        required: true  // "Payment Released", "Job Accepted"
    },
    message: {
        type: String,
        required: true  // "₦22,500 has been added to your wallet"
    },
    type: {
        type: String,
        enum: ['payment', 'delivery', 'weather', 'general'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false  // the blue dot in your Figma
    }
}, { timestamps: true })

const notificationModel = mongoose.model('notification', notificationSchema)
module.exports = notificationModel