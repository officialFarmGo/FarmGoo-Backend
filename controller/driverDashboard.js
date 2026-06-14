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
const driverKycModel = require('../model/driverKyc')
const bankModel = require('../model/bankModel')


// exports.driversDashBoardOverview = async(req, res, next) =>{
//     try{

//         const driverId = req.user.id

//         const driver = await driverModel.findById(driverId)
//         if(!driver){
//             return next({
//                 message: 'driver not found',
//                 statusCode: 404
//             })
//         }

//       const [completedJobsCount, activeDeliveriesCount, todaysEarningsCount, pendingEscrowCount, ] = await Promise.all({

//         })

//     }
//     catch(error){
//         return next({
//             message: 'something went wrong',
//             statusCode: 404
//         })

//     }
// }

exports.driverDashboard = async(req, res, next) => {
    try {
        const driverId = req.user.id

        const driver = await driverModel.findById(driverId)
        if(!driver) {
            return next({ message: 'driver not found', statusCode: 404 })
        }

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const startOfWeek = new Date()
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
        startOfWeek.setHours(0, 0, 0, 0)

        const [
    activeDeliveriesCount,
    todaysEarnings,
    completedThisWeekCount,
    activeDeliveries,
    driverWallet,
    driverKyc
] = await Promise.all([

    // 1. active deliveries count
    deliveryModel.countDocuments({
        driverId,
        status: { $in: ['Accepted', 'In Transit'] }
    }),

    // 2. todays earnings
    driveTransModel.aggregate([
        {
            $match: {
                driver: new mongoose.Types.ObjectId(driverId),
                type: 'Credit',
                createdAt: { $gte: startOfDay }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]),

    // 3. completed this week ✅ fixed query
    deliveryModel.countDocuments({
        driverId,
        status: 'Delivered',
        updatedAt: { $gte: startOfWeek }
    }),

    // 4. active deliveries list ✅
    deliveryModel.find({
        driverId,
        status: { $in: ['Accepted', 'In Transit'] }
    })
    .select('productType weight quantity totalFare trackingId status AddressOrpickUpLocation Destination estimatedDuration')
    .sort({ createdAt: -1 }),

    // 5. driver wallet ✅
    driverWalletModel.findOne({ driver: driverId }),

    // 6. driver kyc ✅
    driverKycModel.findOne({ driver: driverId })
        .populate('vehicleType', 'vehicleType')
])

        let availableJobsCount = 0
        let availableJobsSection = {
            show: false,
            message: "Complete your current delivery to browse new jobs",
            jobs: []
        }

        if(driver.isAvailable) {
            availableJobsCount = await deliveryModel.countDocuments({
                status: 'Pending',
                driverId: { $exists: false }
            })

            const availableJobs = await deliveryModel.find({
                status: 'Pending',
                driverId: { $exists: false }
            })
            .select('productType weight quantity totalFare AddressOrpickUpLocation Destination')
            .sort({ createdAt: -1 })
            .limit(5)

            availableJobsSection = {
                show: true,
                jobs: availableJobs
            }
        }


        res.status(200).json({
            message: 'Driver dashboard fetched successfully',
            data: {
                greeting: `Good Morning, ${driver.firstName}!`,
                stats: {
                    availableJobs: availableJobsCount,
                    activeDeliveries: activeDeliveriesCount,
                    todaysEarnings: todaysEarnings[0]?.total || 0
                },
                activeDeliveries,
                availableJobsSection,
                completedThisWeek: completedThisWeekCount,
                walletBalance: driverWallet?.availableBalance || 0,
                vehicleStatus: {
                    status: driver.isAvailable ? 'Active & Ready' : 'On Delivery',
                    vehicleType: driverKyc?.vehicleType?.vehicleType || 'Not set'
                }
            }
        })

    } catch(error) {
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}





exports.getDriverWallet = async(req, res, next) => {
    try {
        const driverId = req.user.id

        const [wallet, linkedAccounts, transactions] = await Promise.all([

            // wallet balance
            driverWalletModel.findOne({ driver: driverId }),

            // linked bank accounts
            bankModel.find({ driver: driverId }),

            // transaction history
            driveTransModel.find({ driver: driverId })
                .sort({ createdAt: -1 })
                .select('amount type status createdAt description')
                .limit(5)
        ])

        if(!wallet) {
            return next({ message: 'Wallet not found', statusCode: 404 })
        }

        // mask account number - show only last 4 digits
        const maskedAccounts = linkedAccounts.map(account => ({
                    _id: account._id,
                    bankName: account.bankName,
                    accountNumber: `****${account.AccountNumber.slice(-4)}`,
                    accountName: account.AccountName,
                    isPrimary: account.isPrimary
}))
        res.status(200).json({
            message: 'Wallet fetched successfully',
            data: {
                availableBalance: wallet.availableBalance,
                linkedAccounts: maskedAccounts,
                transactions
            }
        })

    } catch(error) {
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}



