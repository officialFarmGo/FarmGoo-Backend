const mongoose = require('mongoose')

agentKycSchema = new mongoose.Schema({
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agents',
        required: true
    },
    state: {
        type: String,
        required: true
    },
    residentialAddress:{
        type: String,
        required: true
    },
    kinsFirstName: {
        type: String,
        required: true
    },
    kinsLastName: {
        type: String,
        required: true
    },
    kinsPhoneNumber: {
        type: String,
        required: true
    },
    kinsEmail: {
        type: String,
        required: true
    },
    kinsRelationship: {
        type: String,
        required: true
    },
    kinsLgaOrTown: {
        type: String,
        required: true
    },
    kinsResidentialAddress: {
        type: String,
        required: true
    },
    verificationDocument:{
        securedUrl: {
            type: String,
            trim: true
        },
        publicId: {
            type:String,
            trim: true
        }
    },
})

const agentKycModel = mongoose.model('agentKycs', agentKycSchema)

module.exports = agentKycModel