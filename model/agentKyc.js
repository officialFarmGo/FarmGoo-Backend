const mongoose = require('mongoose')

agentKycSchema = new mongoose.Schema({
    agentId: {
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
    kinsphoneNumber: {
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



})