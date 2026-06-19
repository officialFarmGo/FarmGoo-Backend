const supportReportModel = require('../model/supportReport')

// maps req.user.role -> ownerType enum stored on the report
const roleToOwnerType = {
    farmer: 'farmers',
    agent: 'agents',
    driver: 'drivers'
}

exports.createSupportReport = async (req, res, next) => {
    try {
        const ownerId = req.user.id
        const role = req.user.role

        const ownerType = roleToOwnerType[role]
        if (!ownerType) {
            return next({ message: 'Invalid user role for support report', statusCode: 400 })
        }

        const { issueType, description } = req.body

        if (!issueType || !description) {
            return next({ message: 'issueType and description are required', statusCode: 400 })
        }

        const report = await supportReportModel.create({
            owner: ownerId,
            ownerType,
            issueType,
            description
        })

        res.status(201).json({
            message: 'Report submitted successfully',
            data: report
        })

    } catch (error) {
        console.log(error)
        return next({ message: error.message, statusCode: 500 })
    }
}

exports.getMySupportReports = async (req, res, next) => {
    try {
        const ownerId = req.user.id

        const reports = await supportReportModel.find({ owner: ownerId })
            .sort({ createdAt: -1 })

        res.status(200).json({
            message: 'Support reports fetched successfully',
            data: reports
        })

    } catch (error) {
        console.log(error)
        return next({ message: error.message, statusCode: 500 })
    }
}