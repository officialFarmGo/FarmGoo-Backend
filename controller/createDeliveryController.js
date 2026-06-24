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
const otpGenerator = require('otp-generator')
const notificationModel = require('../model/notification')
const driverKycModel = require('../model/driverKyc')
const agentDeliveryModel = require('../model/agentDelivery')
const agentFarmerModel = require('../model/agentFarmer')
const agentWalletModel = require('../model/agentWallet')
const agentTransModel = require('../model/agentTransaction')
const agentModel = require('../model/agent')



const getDistance = async (origin, destination) => {
  const response = await axios.get(
    "https://maps.googleapis.com/maps/api/distancematrix/json",
    {
      params: {
        origins: origin,
        destinations: destination,
        key: process.env.GOOGLE_MAPS_API_KEY,
        units: "metric",
      },
    },
  );

  const data = response.data;

  if (data.status !== "OK") {
    throw new Error("Distance could not be calculated. Please provide full pickup and destination details.");
  }

  const element = data.rows[0].elements[0];

  if (element.status !== "OK") {
    throw new Error("Route not found. Please enter complete pickup and destination addresses, including city or state");
  }

  const distanceKm = element.distance.value / 1000;
  const duration = element.duration.text;

  return { distanceKm, duration };
};

const generateTrackingId = async () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let isUnique = false;
  let trackingId;

  while (!isUnique) {
    trackingId = "TRN-";
    for (let i = 0; i < 6; i++) {
      trackingId += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    const existing = await deliveryModel.findOne({ trackingId });
    if (!existing) isUnique = true;
  }

  return trackingId;
};





exports.estimateDeliveryPrice = async (req, res, next) => {
    try {
        const { AddressOrpickUpLocation, Destination, vehhicleId} = req.body

        const vehicle = await vehicleModel.findById(vehhicleId)
        if (!vehicle) {
            return next({ message: 'Vehicle type not found', statusCode: 404 })
        }

        const { distanceKm, duration } = await getDistance(AddressOrpickUpLocation, Destination)

        const totalFare = Math.round(vehicle.baseFare + vehicle.ratePerKm * distanceKm)
        const commission = Math.round((5 / 100) * totalFare)
        const amount = Math.round(totalFare + commission)

        return res.status(200).json({
            message: 'Price estimate calculated',
            data: {
                    deliveryFare: totalFare,
                    serviceFee: commission,
                    total: amount
                
            }
        })

    } catch (error) {
        console.log(error)
        return next({ 
            message: error.message,
             statusCode: 500
             })
    }
}
























exports.createDelivery = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userType = req.user.role;
    const { vehhicleId } = req.params;

    const {
      productType,
      quantity,
      weight,
      AddressOrpickUpLocation,
      landMarkToAddressForPickup,
      Destination,
      customersPhoneNumber,
      CustomersOtherNumber,
      customersName,
      pickupSchedule,
    } = req.body;

    const user = await farmModel.findById(userId);
    if (!user) {
      return next({
        message: "user not found",
        statusCode: 404,
      });
    }
    const PIN = otpGenerator.generate(4, { 
    upperCaseAlphabets: false, 
    lowerCaseAlphabets: false, 
    specialChars: false 
    })

    const vehicle = await vehicleModel.findById(vehhicleId);

    if (!vehicle) {
      return next({ message: "Vehicle type not found", statusCode: 404 });
    }

    const { distanceKm, duration } = await getDistance(
      AddressOrpickUpLocation,
      Destination,
    );

   const totalFare = Math.round(vehicle.baseFare + vehicle.ratePerKm * distanceKm)
    const commission = Math.round((5 / 100) * totalFare)
    const amount = Math.round(totalFare + commission)


    const wallet = await farmerWalletModel.findOne({ farmer: userId });

    if (!wallet) {
      return next({ message: "Wallet not found", statusCode: 404 });
    }

    if (wallet.availableBalance < amount) {
        return next({
            message: `Insufficient wallet balance. Required: ₦${amount.toFixed(2)}, Available: ₦${wallet.availableBalance.toFixed(2)}`,
            statusCode: 400
        })
    }


    const trackingId = await generateTrackingId();

    const delivery = await deliveryModel.create({
      farmerId: user._id,
      trackingId,
      productType,
      quantity,
      PIN,
      commission,
      weight,
      amount,
      AddressOrpickUpLocation,
      landMarkToAddressForPickup,
      Destination,
      customersPhoneNumber,
      CustomersOtherNumber,
      customersName,
      pickupSchedule,
      vehhicleId: vehicle._id,
      totalFare,
      estimatedDuration: duration
    });

   const matchingKycs = await driverKycModel.find({ vehicleType: vehicle._id })
       const matchingDriverIds = matchingKycs.map(k => k.driver)
   
       const drivers = await driverModel.find({
         _id: { $in: matchingDriverIds },
         kycVerified: true,
         isAvailable: true,
       });
   
       if(drivers.length > 0) {
         await brevoBulk(
             drivers, 
             newDeliveryRequestTemplate(delivery.trackingId, AddressOrpickUpLocation, Destination, totalFare),
             "New Delivery Request Available - FarmGoo"
         )
       }
       res.status(201).json({
         message: "Delivery request created successfully",
         data: {
           delivery,
           estimatedDuration: duration,
           distance: `${distanceKm.toFixed(2)}km`,
         },
       });
     } catch (error) {
       console.log(error);
       return next({
         message: error.message || "something went wrong",
         statusCode: 500,
       });
     }
   };
   

// Get all delivery function

// Get all one delivery function

exports.acceptDelivery = async (req, res, next) => {
    const session = await require('mongoose').startSession()
    session.startTransaction()

    try {
        const driverId = req.user.id
        const { deliveryId } = req.params

        const [farmerDelivery, agentDelivery] = await Promise.all([
            deliveryModel.findOne({ _id: deliveryId, status: 'Pending' }),
            agentDeliveryModel.findOne({ _id: deliveryId, status: 'Pending' })
        ])

        const pendingDelivery = farmerDelivery || agentDelivery

        if (!pendingDelivery) {
            await session.abortTransaction()
            return next({ message: 'Delivery does not exist or is no longer available', statusCode: 404 })
        }

        const driverKyc = await driverKycModel.findOne({ driver: driverId })
        if (!driverKyc) {
            await session.abortTransaction()
            return next({ message: 'Complete your KYC before accepting deliveries', statusCode: 403 })
        }

        
        const deliveryVehicleId = farmerDelivery
            ? pendingDelivery.vehhicleId.toString()
            : pendingDelivery.vehicleType.toString()

        if (driverKyc.vehicleType.toString() !== deliveryVehicleId) {
            await session.abortTransaction()
            return next({
                message: 'Your vehicle type does not match what was requested. You can only accept jobs that match your registered vehicle.',
                statusCode: 403
            })
        }

        const driver = await driverModel.findById(driverId)
        if (!driver) {
            await session.abortTransaction()
            return next({ message: 'Driver not found', statusCode: 404 })
        }

        let deliveryWithoutPin

        if (farmerDelivery) {
            const delivery = await deliveryModel.findOneAndUpdate(
                { _id: deliveryId, status: 'Pending' },
                { driverId, status: 'Accepted' },
                { new: true, session }
            )
            if (!delivery) {
                await session.abortTransaction()
                return next({ message: 'Delivery was already accepted by another driver', statusCode: 409 })
            }

            const farmWallet = await farmerWalletModel.findOneAndUpdate(
                { farmer: delivery.farmerId, availableBalance: { $gte: delivery.amount } },
                { $inc: { availableBalance: -delivery.amount, escrowBalance: +delivery.totalFare } },
                { new: true, session }
            )
            if (!farmWallet) {
                await session.abortTransaction()
                return next({ message: 'Farmer has insufficient balance', statusCode: 400 })
            }

            await farmTransModel.create([{
                farmer: delivery.farmerId,
                wallet: farmWallet._id,
                delivery: delivery._id,
                amount: delivery.amount,
                type: 'Debit',
                description: `Payment held for delivery ${delivery.trackingId}`,
                status: 'Pending Release'
            }], { session })

            await new notificationModel({
                owner: delivery.farmerId,
                ownerType: 'farmers',
                title: 'Job Accepted',
                message: `Driver ${driver.firstName} ${driver.lastName} accepted your transport request`,
                type: 'delivery'
            }).save({ session })

            deliveryWithoutPin = await deliveryModel.findById(deliveryId).select('-PIN')

        } else {
            const delivery = await agentDeliveryModel.findOneAndUpdate(
                { _id: deliveryId, status: 'Pending' },
                { driverId, status: 'Accepted' },
                { new: true, session }
            )
            if (!delivery) {
                await session.abortTransaction()
                return next({ message: 'Delivery was already accepted by another driver', statusCode: 409 })
            }

            const agentWallet = await agentWalletModel.findOneAndUpdate(
                { agent: delivery.agentId, availableBalance: { $gte: delivery.amount } },
                { $inc: { availableBalance: -delivery.amount, escrowBalance: +delivery.totalFare } },
                { new: true, session }
            )
            if (!agentWallet) {
                await session.abortTransaction()
                return next({ message: 'Agent has insufficient balance', statusCode: 400 })
            }

            await agentTransModel.create([{
                agent: delivery.agentId,
                wallet: agentWallet._id,
                delivery: delivery._id,
                amount: delivery.amount,
                type: 'Debit',
                description: `Payment held for delivery ${delivery.trackingId}`,
                status: 'Pending'
            }], { session })

            await new notificationModel({
                owner: delivery.agentId,
                ownerType: 'agents',
                title: 'Job Accepted',
                message: `Driver ${driver.firstName} ${driver.lastName} accepted your transport request`,
                type: 'delivery'
            }).save({ session })

            deliveryWithoutPin = await agentDeliveryModel.findById(deliveryId).select('-PIN')
        }

        await driverModel.findByIdAndUpdate(driverId, { isAvailable: false }, { session })
        await session.commitTransaction()

        res.status(200).json({
            message: 'Delivery accepted successfully',
            data: deliveryWithoutPin
        })

    } catch (error) {
        await session.abortTransaction()
        console.log(error.message)
        return next({ message: error.message, statusCode: 500 })
    } finally {
        session.endSession()
    }
}



exports.completeDelivery = async (req, res, next) => {
    const session = await require('mongoose').startSession()
    session.startTransaction()

    try {
        const driverId = req.user.id
        const { deliveryId } = req.params
        const { PIN } = req.body

        // Check both models — must belong to this driver and be Accepted
        const [farmerDelivery, agentDelivery] = await Promise.all([
            deliveryModel.findOne({ _id: deliveryId, driverId, status: 'Accepted' }),
            agentDeliveryModel.findOne({ _id: deliveryId, driverId, status: 'Accepted' })
        ])

        const delivery = farmerDelivery || agentDelivery

        if (!delivery) {
            await session.abortTransaction()
            return next({ message: 'Delivery not found', statusCode: 404 })
        }

        if (delivery.PIN !== PIN) {
            await session.abortTransaction()
            return next({ message: 'Invalid PIN', statusCode: 400 })
        }

        if (farmerDelivery) {
            // ── FARMER DELIVERY ──────────────────────────────────────────
            await deliveryModel.findByIdAndUpdate(deliveryId, { status: 'Delivered' }, { session })

            await farmerWalletModel.findOneAndUpdate(
                { farmer: delivery.farmerId },
                { $inc: { escrowBalance: -delivery.totalFare } },
                { session }
            )

            const driverWallet = await driverWalletModel.findOneAndUpdate(
                { driver: driverId },
                { $inc: { availableBalance: +delivery.totalFare } },
                { new: true, session }
            )

            await driveTransModel.create([{
                driver: driverId,
                wallet: driverWallet._id,
                delivery: delivery._id,
                amount: delivery.totalFare,
                type: 'Credit',
                description: `Payment received for delivery ${delivery.trackingId}`,
                status: 'Successful'
            }], { session })

            await farmTransModel.findOneAndUpdate(
                { delivery: delivery._id },
                { status: 'completed' },
                { session }
            )

            await new notificationModel({
                owner: delivery.farmerId,
                ownerType: 'farmers',
                title: 'Delivery Completed',
                message: `Your ${delivery.productType} has been Delivered Successfully`,
                type: 'delivery'
            }).save({ session })

        } else {
            // ── AGENT DELIVERY ───────────────────────────────────────────
            await agentDeliveryModel.findByIdAndUpdate(deliveryId, { status: 'Delivered' }, { session })

            await agentWalletModel.findOneAndUpdate(
                { agent: delivery.agentId },
                { $inc: { escrowBalance: -delivery.totalFare } },
                { session }
            )

            const driverWallet = await driverWalletModel.findOneAndUpdate(
                { driver: driverId },
                { $inc: { availableBalance: +delivery.totalFare } },
                { new: true, session }
            )

            await driveTransModel.create([{
                driver: driverId,
                wallet: driverWallet._id,
                delivery: delivery._id,
                amount: delivery.totalFare,
                type: 'Credit',
                description: `Payment received for delivery ${delivery.trackingId}`,
                status: 'Successful'
            }], { session })

            await agentTransModel.findOneAndUpdate(
                { delivery: delivery._id },
                { status: 'Completed' },
                { session }
            )

            await new notificationModel({
                owner: delivery.agentId,
                ownerType: 'agents',
                title: 'Delivery Completed',
                message: `Your ${delivery.produceType} has been Delivered Successfully`,
                type: 'delivery'
            }).save({ session })
        }

        // Shared across both paths
        const driverWalletForNotification = await driverWalletModel.findOne({ driver: driverId })

        await new notificationModel({
            owner: driverId,
            ownerType: 'drivers',
            title: 'Delivery Completed',
            message: `₦${delivery.totalFare.toLocaleString()} has been added to your wallet`,
            type: 'delivery'
        }).save({ session })

        await driverModel.findByIdAndUpdate(driverId, { isAvailable: true }, { session })
        await session.commitTransaction()

        res.status(200).json({
            message: 'Delivery completed successfully',
            data: {
                trackingId: delivery.trackingId,
                amountEarned: `₦${delivery.totalFare.toLocaleString()}`
            }
        })

    } catch (error) {
        await session.abortTransaction()
        console.log(error.message)
        return next({ message: error.message, statusCode: 500 })
    } finally {
        session.endSession()
    }
}


exports.rejectDelivery = async(req, res, next) => {
    try {
        const driverId = req.user.id
        const { deliveryId } = req.params

        const [farmerDelivery, agentDelivery] = await Promise.all([
            deliveryModel.findById(deliveryId),
            agentDeliveryModel.findById(deliveryId)
        ])

        const delivery = farmerDelivery || agentDelivery

        if(!delivery) {
            return next({ message: 'delivery not found', statusCode: 404 })
        }

        if(farmerDelivery) {
            await deliveryModel.findByIdAndUpdate(
                deliveryId,
                { $addToSet: { rejectedBy: driverId } }
            )
        } else {
            await agentDeliveryModel.findByIdAndUpdate(
                deliveryId,
                { $addToSet: { rejectedBy: driverId } }
            )
        }

        res.status(200).json({
            message: 'Delivery rejected'
        })

    } catch(error) {
        return next({ message: error.message, statusCode: 500 })
    }
}