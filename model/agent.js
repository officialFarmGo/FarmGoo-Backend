const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        trim: true,
        unique: true
    },
    townOrVillage: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    role: {
        type: String, 
        default: 'agent'
    }
}, { timestamps: true } )

const agentModel = mongoose.model('agent', agentSchema)

module.exports = agentModel