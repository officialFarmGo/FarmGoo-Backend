const mongoose = require('mongoose')

const farmKycSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'farmers',
        required: true
    },
    specificLocationOrLandmark: {
        type: String,
        trim: true,
        required: true
    },
    whatDoYouFarm:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'crops',
        required: true
    }],
    preferredMarketDestination: {
        type: String,
        trim: true,
        required: true
    },
    farmSize:{
        type: String,
        enum: ['Small', 'Medium', 'Large', 'Very Large'],
        required: true
    },
    state: {
        type: String,
        required: true
    }
},{ timestamps: true })

const farmKycModel =  mongoose.model('farmKyc', farmKycSchema)

module.exports = farmKycModel