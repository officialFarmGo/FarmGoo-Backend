const notificationModel = require('../model/notification')

const createNotification = async(owner, ownerType, title, message, type) => {
    try {
        await notificationModel.create({
            owner,
            ownerType,
            title,
            message,
            type
        })
    } catch(error) {
        console.log('notification error', error.message)
        // never throw - notifications failing shouldn't break the main flow
    }
}

module.exports = createNotification