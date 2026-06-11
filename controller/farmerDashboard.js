const deliveryModel = require("../model/delivery");
const vehicleModel = require("../model/vehicleType");
const farmerWalletModel = require("../model/farmerWallet");
const driverWalletModel = require("../model/driverWallet");
const farmModel = require("../model/farm");
const farmTransModel = require("../model/farmerTrans");
const driveTransModel = require("../model/driverTransactionModel");
const driverModel = require("../model/driver");
const axios = require("axios");
const brevo = require("../utils/brevo");
const brevoBulk = require('../utils/brevoBulk') 
const { newDeliveryRequestTemplate } = require('../utils/bulkTemplate');
const farmWalletModel = require("../model/farmerWallet");
const otpGenerator = require('otp-generator');
const getWeatherAlert = require('../utils/weather')
const marketTipsModel = require('../model/marketTips')
const mongoose = require('mongoose')



exports.dashBoardOverview = async(req, res, next) =>{
    try{
        const farmerId = req.user.id

        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const farmer = await farmModel.findById(farmerId)
        if(!farmer) {
            return next({ message: 'farmer not found', statusCode: 404 })
        }

        const [activeDeliveriesCount,
            pendingRequestsCount,
            completedThisMonthCount,
            totalSpentThisMonth,
            activeDeliveries,
            recentDeliveries,
            marketTips 
            ] = await Promise.all([
                deliveryModel.countDocuments({
                    farmerId,
                    status: {$in: ['Accepted', 'In Transit']}

    }), 
        deliveryModel.countDocuments({
            farmerId,
            status: 'Pending'
        }),
        deliveryModel.countDocuments({
            farmerId,
            status: 'Delivered'
        }),
        farmTransModel.aggregate([
            {
                $match: {
                    farmer:  mongoose.Types.ObjectId.createFromHexString(farmerId),
                    type: 'Debit',
                    createdAt: {$gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: {$sum: '$amount'}
                }
            }
        ]),

           

        deliveryModel.find({farmerId,
           status: { $in: ['Pending', 'Accepted', 'In Transit'] }       
        }).populate('driverId', 'firstName lastName')
        .select('productType status trackingId AddressOrpickUpLocation Destination quantity weight driverId')
        .sort({createdAt: -1}) 
        .limit(2),

        deliveryModel.find({
                farmerId,
                status: 'Delivered'
            })
            .select('productType quantity weight amount updatedAt status')
            .sort({ updatedAt: -1 })
            .limit(2),

            marketTipsModel.find({ isActive: true })
                .sort({ createdAt: -1 })
                .limit(2)
             ])

         const weatherAlert = await getWeatherAlert(farmer.townOrVillage || 'Lagos')


         res.status(200).json({
          message: 'Dashboard fetched successfully',
          data: {
            stats: {
             activeDeliveries: activeDeliveriesCount,
            pendingRequests: pendingRequestsCount,
            completedThisMonth: completedThisMonthCount,
            totalSpentThisMonth: totalSpentThisMonth[0]?.total || 0
                },
            weatherAlert,
            activeDeliveries,
            recentDeliveries,
            marketTips
            }

         })

    }
    catch(error){
        console.log(error)
        return next({
            message: 'something went wrong',
            statusCode: 500
        })

    }
}
