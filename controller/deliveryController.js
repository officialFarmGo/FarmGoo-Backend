const deliveryModel = require('../model/delivery')

const farmModel = require('../model/farm')

const driverModel = require('../model/driver')

const axios = require('axios')



exports.testDistane = async(req, res, next) =>{
    try{
        const {origin, destination} = req.body

        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/distancematrix/json', 
            { 
                params: {
                destinations: destination,
                origins: origin,
                key: process.env.GOOGLE_MAPS_API_KEY,
                units: 'metric'

                } 
            }
        )

        const data = response.data
        const element = data.rows[0].elements[0]
        const distanceKm = element.distance.value / 1000
        const duration = element.duration.text

        res.status(200).json({
            message: 'Distance calculated',
            duration,
            raw: data

        })

    }
    catch(error){
        console.log(error.message)
        return next({
            message: 'something went wrong',
            statusCode: 500
        })

    }
}










exports.createDelivery = async(req, res, next) =>{
    try{
 const {productType, quantity, weight, AddressOrpickUpLocation, landMarkToAddressForPickup,Destination, customersPhoneNumber, CustomersOtherNumber, pickupSchedule, vehicleType} = req.body

    }
    catch(error){

    }
}




// exports.completeDelivery = async(req, res, next) => {
//     const session = await require('mongoose').startSession()
//     session.startTransaction()

//     try {
//         const driverId = req.user.id
//         const { deliveryId } = req.params
//         const { PIN } = req.body  // driver enters this

//         // find delivery WITH PIN to verify (don't use .select('-PIN') here)
//         const delivery = await deliveryModel.findOne({
//             _id: deliveryId,
//             driverId: driverId,
//             status: 'Accepted'
//         })

//         if(!delivery) {
//             await session.abortTransaction()
//             return next({ message: 'Delivery not found', statusCode: 404 })
//         }

//         // verify PIN
//         if(delivery.PIN !== PIN) {
//             await session.abortTransaction()
//             return next({ message: 'Invalid PIN', statusCode: 400 })
//         }

//         // update delivery status
//         await deliveryModel.findByIdAndUpdate(
//             deliveryId,
//             { status: 'Delivered' },
//             { session }
//         )

//         // release escrow from farmer wallet
//         await farmWalletModel.findOneAndUpdate(
//             { farmer: delivery.farmerId },
//             { $inc: { escrowBalance: -delivery.totalFare } },
//             { session }
//         )

//         // credit driver wallet
//         const driverWallet = await driverWalletModel.findOneAndUpdate(
//             { driver: driverId },
//             { $inc: { availableBalance: +delivery.totalFare } },
//             { new: true, session }
//         )

//         // create driver transaction
//         await driverTransactionModel.create([{
//             driver: driverId,
//             wallet: driverWallet._id,
//             delivery: delivery._id,
//             amount: delivery.totalFare,
//             type: 'Credit',
//             description: `Payment received for delivery ${delivery.trackingId}`,
//             status: 'Successful'
//         }], { session })

//         // update farmer transaction to completed
//         await farmerTransactionModel.findOneAndUpdate(
//             { delivery: deliveryId },
//             { status: 'completed' },
//             { session }
//         )

//         // mark driver available again
//         await driverModel.findByIdAndUpdate(
//             driverId,
//             { isAvailable: true },
//             { session }
//         )

//         await session.commitTransaction()

//         res.status(200).json({
//             message: 'Delivery completed successfully',
//             data: {
//                 trackingId: delivery.trackingId,
//                 amountEarned: `₦${delivery.totalFare}`
//             }
//         })

//     } catch(error) {
//         await session.abortTransaction()
//         console.log(error)
//         return next({ message: 'something went wrong', statusCode: 500 })
//     } finally {
//         session.endSession()
//     }
// }