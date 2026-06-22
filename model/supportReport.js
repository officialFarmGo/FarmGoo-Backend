const mongoose = require('mongoose')

const supportReportSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    ownerType: {
        type: String,
        enum: ['farmers', 'agents', 'drivers'],
        required: true
    },
    issueType: {
        type: String,
        enum: ['Payment Issue', 'Delivery Problem', 'Driver Complaint', 'Technical Issue', 'Other'],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        default: 'Open'
    }
}, { timestamps: true })

const supportReportModel = mongoose.model('supportReports', supportReportSchema)

module.exports = supportReportModel