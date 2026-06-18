const notificationModel = require('../model/notification')


exports.getFarmerNotifications = async(req, res, next) => {
    try {
        const farmerId = req.user.id

        const notifications = await notificationModel.find({
            owner: farmerId,
            ownerType: 'farmers'
        })
        .sort({ createdAt: -1 })

        const unreadCount = notifications.filter(n => !n.isRead).length

        res.status(200).json({
            message: 'Notifications fetched successfully',
            data: {
                unreadCount,
                notifications
            }
        })

    } catch(error) {
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}

// mark all as read
exports.markAllAsRead = async(req, res, next) => {
    try {
        const farmerId = req.user.id

        await notificationModel.updateMany(
            { owner: farmerId, ownerType: 'farmers', isRead: false },
            { isRead: true }
        )

        res.status(200).json({
            message: 'All notifications marked as read'
        })

    } catch(error) {
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}

exports.markOneAsRead = async(req, res, next) => {
    try {
        const { notificationId } = req.params

        await notificationModel.findByIdAndUpdate(
            notificationId,
            { isRead: true }
        )

        res.status(200).json({
            message: 'Notification marked as read'
        })

    } catch(error) {
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}



exports.getagentNotifications = async(req, res, next) => {
    try {
        const agentId = req.user.id

        const notifications = await notificationModel.find({
            owner: agentId,
            ownerType: 'agents'
        })
        .sort({ createdAt: -1 })

        const unreadCount = notifications.filter(n => !n.isRead).length

        res.status(200).json({
            message: 'Notifications fetched successfully',
            data: {
                unreadCount,
                notifications
            }
        })

    } catch(error) {
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}


exports.getDriversNotification = async(req, res, next) =>{
    try{

        const driverId = req.user.id
        const notifications = await notificationModel.find({
            owner: driverId,
            ownerType: 'drivers'
        })
        .sort({ createdAt: -1 })

         const unreadCount = notifications.filter(n => !n.isRead).length

        res.status(200).json({
            message: 'Notifications fetched successfully',
            data: {
                unreadCount,
                notifications
            }
        })

    }
    catch(error){
        return next({
            message: error.message,
            statusCode: 500
        })

    }
}