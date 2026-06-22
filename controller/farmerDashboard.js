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
const bankModel = require('../model/bankModel')
const cloudinary = require('../utils/cloudinary')
const fs = require('fs')
const farmKycModel = require('../model/farmerKyc')




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
         console.log('API KEY:', process.env.OPENWEATHER_API_KEY)


         res.status(200).json({
          message: 'Dashboard fetched successfully',
          data: {
            greeting: `${farmer.firstName} ${farmer.lastName}`,
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

exports.activeDeliveriesOverview = async (req, res, next) => {
    try {
        const farmerId = req.user.id;

        const [total, pending, accepted, delivered, activeDeliveries] = await Promise.all([
            deliveryModel.countDocuments({ farmerId, status: { $in: ["Pending", "Accepted", "In Transit", "Delivered"] } }),
            deliveryModel.countDocuments({ farmerId, status: 'Pending' }),
            deliveryModel.countDocuments({ farmerId, status: 'Accepted' }),
            deliveryModel.countDocuments({ farmerId, status: 'Delivered' }),
            deliveryModel.find({
                farmerId,
                status: { $in: ['Pending', 'Accepted', 'In Transit'] }
            })
            .select('productType quantity weight trackingId status AddressOrpickUpLocation Destination estimatedDuration totalFare driverId')
            .populate('driverId', 'firstName lastName phoneNumber')   
            .sort({ createdAt: -1 })
        ]);

        res.status(200).json({
            message: 'successfully gotten all active deliveries',
            data: {
                status: { total, pending, Accepted: accepted, Delivered: delivered },
                activeDeliveries   // driverId will now be a populated object (or null if no driver)
            }
        });
    } catch (error) {
        console.error("Overview Error:", error);
        return next({ message: 'something went wrong', statusCode: 500 });
    }
};
// exports.farmerTrackDelivery = async(req, res, next) => {
//     try {
//         const farmerId = req.user.id
//         const { deliveryId } = req.params

//         const delivery = await deliveryModel.findOne({
//             _id: deliveryId,
//             farmerId,
//             status: { $in: ['Pending', 'Accepted', 'In Transit'] }  
//         })
//         .populate('driverId', 'firstName lastName phoneNumber')
//         .populate('vehhicleId', 'vehicleType')
//         .lean()

//         if(!delivery) {
//             return next({ message: 'Active delivery not found', statusCode: 404 })
//         }

//         // Weather for the pickup route
//         const weatherAlert = await getWeatherAlert(delivery.AddressOrpickUpLocation)

//         // Escrow status based on delivery status
//         const escrowStatusMap = {
//             'Pending':    'Not Started',
//             'Accepted':   'Held',
//             'In Transit': 'Held',
//             'Delivered':  'Released'
//         }
//         const escrowStatus = escrowStatusMap[delivery.status] || 'Not Started'

//         return res.status(200).json({
//             message: 'Delivery tracked successfully',
//             data: {
//                 trackingId: delivery.trackingId,
//                 status: delivery.status,
//                 estimatedDuration: delivery.estimatedDuration || 'N/A',

//                 // PIN — farmer shares this with customer at delivery point
//                 deliveryPIN: delivery.PIN,

//                 // Driver section — null if no driver has accepted yet
//                 driverDetails: delivery.driverId ? {
//                     name: `${delivery.driverId.firstName} ${delivery.driverId.lastName}`,
//                     phoneNumber: delivery.driverId.phoneNumber,
//                     vehicleType: delivery.vehhicleId?.vehicleType || null
//                 } : null,

//                 // Customer section
//                 customerDetails: {
//                     name: delivery.customersName || null,
//                     phoneNumber: delivery.customersPhoneNumber,
//                     otherNumber: delivery.CustomersOtherNumber
//                 },

//                 // Delivery details panel
//                 deliveryDetails: {
//                     produce: `${delivery.productType} - ${delivery.quantity}${delivery.weight}`,
//                     pickupLocation: delivery.AddressOrpickUpLocation,
//                     landmark: delivery.landMarkToAddressForPickup || null,
//                     destination: delivery.Destination,
//                     agreedFee: `₦${delivery.totalFare?.toLocaleString()}`,
//                     agreedFeeRaw: delivery.totalFare,
//                     escrowStatus
//                 },

//                 weatherAlert
//             }
//         })

//     } catch(error) {
//         console.log(error)
//         return next({ message: 'something went wrong', statusCode: 500 })
//     }
// }



exports.getFarmerWallet = async(req, res, next) => {
    try {
        const farmerId = req.user.id

        const [wallet, linkedAccounts, transactions] = await Promise.all([

            // wallet balance
            farmWalletModel.findOne({ farmer: farmerId }),

            // linked bank accounts
            bankModel.find({ farmerId: farmerId }),

            // transaction history
            farmTransModel.find({ farmer: farmerId })
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
                escrowBalance: wallet.escrowBalance,
                linkedAccounts: maskedAccounts,
                transactions
            }
        })

    } catch(error) {
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}


exports.farmerTrackDelivery = async(req, res, next) => {
    try {
        const farmerId = req.user.id
        const { deliveryId } = req.params

        const delivery = await deliveryModel.findOne({
            _id: deliveryId,
            farmerId
        })
        .populate('driverId', 'firstName lastName phoneNumber')
        .populate('vehhicleId', 'vehicleType')

        if(!delivery) {
            return next({ message: 'delivery not found', statusCode: 404 })
        }

        // get weather for the route
        const weatherAlert = await getWeatherAlert(delivery.AddressOrpickUpLocation)

        // escrow status based on delivery status
        let escrowStatus = 'Not Started'
        if(delivery.status === 'Accepted') escrowStatus = 'Held'
        if(delivery.status === 'In Transit') escrowStatus = 'Held'
        if(delivery.status === 'Delivered') escrowStatus = 'Released'

        res.status(200).json({
            message: 'Delivery tracked successfully',
            data: {
                trackingId: delivery.trackingId,
                status: delivery.status,
                estimatedDuration: delivery.estimatedDuration,

                // PIN — shown to farmer so they can share with customer
                deliveryPIN: delivery.PIN,

                driverDetails: delivery.driverId ? {
                    name: `${delivery.driverId.firstName} ${delivery.driverId.lastName}`,
                    phoneNumber: delivery.driverId.phoneNumber,
                    vehicleType: delivery.vehhicleId?.vehicleType || null
                } : null,

                // customerName goes here when you add it to the model
                customerDetails: {
                    // customerName: delivery.customerName  ← add this when ready
                    phoneNumber: delivery.customersPhoneNumber,
                    otherNumber: delivery.CustomersOtherNumber
                },

                deliveryDetails: {
                    produce: `${delivery.productType} - ${delivery.quantity}${delivery.weight}`,
                    pickupLocation: delivery.AddressOrpickUpLocation,
                    landmark: delivery.landMarkToAddressForPickup,
                    destination: delivery.Destination,
                    agreedFee: delivery.totalFare,
                    escrowStatus
                },

                weatherAlert
            }
        })

    } catch(error) {
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}


exports.getOneFarmer = async(req, res, next) => {
    try{
        const farmerId = req.user.id

    const farmer = await farmModel.findById(farmerId)
        if(!farmer){
            return next({
                message: 'farmer not found',
                statusCode: 404
            })
        }
        res.status(200).json({
            message: 'gotten one farmer',
            data: farmer
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



exports.updateFarmerProfile = async(req, res, next) => {
    try {
        const farmerId = req.user.id
        const { firstName, lastName, email, townOrVillage, farmSize, phoneNumber} = req.body

        const farmer = await farmModel.findById(farmerId)
        if(!farmer) {
            return next({ message: 'farmer not found', statusCode: 404 })
        }

        const updateFields = {
            firstName: firstName || farmer.firstName,
            lastName: lastName || farmer.lastName,
            email: email || farmer.email,
            townOrVillage: townOrVillage || farmer.townOrVillage,
            phoneNumber: phoneNumber || farmer.phoneNumber,
        }

        // handle profile picture upload if provided
        if(req.files && req.files.profilePicture) {
            const newfile = req.files.profilePicture
            const newImage = newfile.map((e) => e.path)

            const uploadtocloudinary = newImage.map((e) => cloudinary.uploader.upload(e))
            const cloudinaryResponse = await Promise.all(uploadtocloudinary)

            // delete old picture from cloudinary if exists
            if(farmer.profilePicture?.publicId) {
                await cloudinary.uploader.destroy(farmer.profilePicture.publicId)
            }

            updateFields.profilePicture = {
                securedUrl: cloudinaryResponse[0].secure_url,
                publicId: cloudinaryResponse[0].public_id
            }

           await Promise.all(
                   newfile.map((e) => {
                       try {
                           fs.unlinkSync(e.path)
                       } catch(err) {
                           console.log('file already deleted:', e.path)
                       }
                       })
                   )
               }
           
        const updatedFarmer = await farmModel.findByIdAndUpdate(
            farmerId,
            updateFields,
            { new: true }
        ).select('-password -otp -otpExpiresAt')

        // update farmSize in KYC if provided
        if(farmSize) {
            await farmKycModel.findOneAndUpdate(
                { farmer: farmerId },
                { farmSize }
            )
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            data: updatedFarmer
        })

    } catch(error) {
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}