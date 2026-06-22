const mongoose = require('mongoose')

const sendUsSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: true
    },
    howCanWeHelp: {
        type: String,
        trim: true,
        required: true
    }
},{timestamps: true})

const sendUsMessageModel = mongoose.model('sendUsMessage', sendUsSchema)

module.exports = sendUsMessageModel



