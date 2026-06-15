const agentFarmerModel = require('../model/agentFarmer')
const agentWalletModel = require('../model/agentWallet')
const agentTransModel = require('../model/agentTransaction')
const driveTransModel = require("../model/driverTransactionModel");
const driverModel = require("../model/driver");
const agentModel = require('../model/agent')
const otpGenerator = require('otp-generator')
const axios = require("axios");
const brevo = require("../utils/brevo");
const brevoBulk = require('../utils/brevoBulk') 
const agentDeliveryModel = require('../model/agentDelivery')
const { newDeliveryRequestTemplate } = require('../utils/bulkTemplate');
const vehicleModel = require("../model/vehicleType");
const driverWalletModel = require("../model/driverWallet");
const notificationModel = require('../model/notification')
const driverKycModel = require('../model/driverKyc')   // ← added


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
  console.log('Google Maps response:', JSON.stringify(data))

  if (data.status !== "OK") {
    throw new Error("Could not calculate distance");
  }

  const element = data.rows[0].elements[0];

  if (element.status !== "OK") {
    throw new Error("Could not find route between locations");
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
    const existing = await agentDeliveryModel.findOne({ trackingId })
    if (!existing) isUnique = true;
  }

  return trackingId;
};

exports.agentCreateDelivery = async (req, res, next) => {
    try {
        const agentId = req.user.id
        const { vehhicleId } = req.params

        const {
            agentFarmerId,  
            produceType,
            quantity,
            pickupLocation,
            Destination,
            customersDetails
        } = req.body

        const agent = await agentModel.findById(agentId)
        if (!agent) {
            return next({ message: 'Agent not found', statusCode: 404 })
        }

        const agentFarmer = await agentFarmerModel.findById(agentFarmerId)
        if (!agentFarmer) {
            return next({ message: 'Farmer not found', statusCode: 404 })
        }

        const PIN = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        const vehicle = await vehicleModel.findById(vehhicleId)
        if (!vehicle) {
            return next({ message: 'Vehicle type not found', statusCode: 404 })
        }

        const { distanceKm, duration } = await getDistance(pickupLocation, Destination)

        const totalFare = Math.round(vehicle.baseFare + vehicle.ratePerKm * distanceKm)
        const commission = Math.round((10 / 100) * totalFare)
        const amount = Math.round(totalFare + commission)

        const agentWallet = await agentWalletModel.findOne({ agent: agentId })
        if (!agentWallet) {
            return next({ message: 'Wallet not found', statusCode: 404 })
        }

        if (agentWallet.availableBalance < amount) {
            return next({
                message: `Insufficient wallet balance. Required: ₦${amount.toLocaleString()}, Available: ₦${agentWallet.availableBalance.toLocaleString()}`,
                statusCode: 400
            })
        }

        const trackingId = await generateTrackingId()

        const delivery = await agentDeliveryModel.create({
            agentId,
            agentFarmerId,
            trackingId,
            PIN,
            produceType,
            quantity,
            amount,
            commission,
            totalFare,
            pickupLocation,
            Destination,
            customersDetails,
            vehicleType: vehicle._id,
            estimatedDuration: duration,
            requestedByType: 'agents'
        })

        // CHANGE 1: Only broadcast to drivers whose KYC vehicle type matches
        const matchingKycs = await driverKycModel.find({ vehicleType: vehicle._id })
        const matchingDriverIds = matchingKycs.map(k => k.driver)

        const drivers = await driverModel.find({
            _id: { $in: matchingDriverIds },
            kycVerified: true,
            isAvailable: true
        })

        if (drivers.length > 0) {
            await brevoBulk(
                drivers,
                newDeliveryRequestTemplate(delivery.trackingId, pickupLocation, Destination, totalFare),
                'New Delivery Request Available - FarmGoo'
            )
        }

        res.status(201).json({
            message: 'Delivery request created successfully',
            data: {
                delivery,
                estimatedDuration: duration,
                distance: `${distanceKm.toFixed(2)}km`,
                totalFare: `₦${totalFare.toLocaleString()}`,
                commission: `₦${commission.toLocaleString()}`,
                totalAmount: `₦${amount.toLocaleString()}`
            }
        })

    } catch (error) {
        console.log(error)
        return next({ message: error.message || 'something went wrong', statusCode: 500 })
    }
}


exports.agentDeliveryAccept = async (req, res, next) => {
    const session = await require('mongoose').startSession()
    session.startTransaction()

    try {
        const driverId = req.user.id
        const { deliveryId } = req.params

        // Fetch delivery first to check vehicle type before touching any data
        const pendingDelivery = await agentDeliveryModel.findOne({
            _id: deliveryId,
            status: 'Pending'
        })

        if (!pendingDelivery) {
            await session.abortTransaction()
            return next({ message: 'Delivery not available or already accepted', statusCode: 404 })
        }

        // CHANGE 2: Guard — driver's KYC vehicle must match the requested vehicle
        const driverKyc = await driverKycModel.findOne({ driver: driverId })
        if (!driverKyc) {
            await session.abortTransaction()
            return next({ message: 'Complete your KYC before accepting deliveries', statusCode: 403 })
        }

        if (driverKyc.vehicleType.toString() !== pendingDelivery.vehicleType.toString()) {
            await session.abortTransaction()
            return next({
                message: 'Your vehicle type does not match what was requested. You can only accept jobs that match your registered vehicle.',
                statusCode: 403
            })
        }

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
            {
                agent: delivery.agentId,
                availableBalance: { $gte: delivery.amount }
            },
            {
                $inc: {
                    availableBalance: -delivery.amount,
                    escrowBalance: +delivery.totalFare
                }
            },
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

        const driver = await driverModel.findById(driverId)
        if (!driver) {
            await session.abortTransaction()
            return next({ message: 'Driver not found', statusCode: 404 })
        }

        await driverModel.findByIdAndUpdate(driverId, { isAvailable: false }, { session })

        await new notificationModel({
            owner: delivery.agentId,
            ownerType: 'agents',
            title: 'Job Accepted',
            message: `Driver ${driver.firstName} ${driver.lastName} accepted your transport request`,
            type: 'delivery'
        }).save({ session })

        await session.commitTransaction()

        const deliveryWithoutPin = await agentDeliveryModel.findById(deliveryId).select('-PIN')

        res.status(200).json({
            message: 'Delivery accepted successfully',
            data: deliveryWithoutPin
        })

    } catch (error) {
        await session.abortTransaction()
        console.log(error.message)
        return next({ message: 'something went wrong', statusCode: 500 })
    } finally {
        session.endSession()
    }
}


exports.agentCompleteDelivery = async (req, res, next) => {
    const session = await require('mongoose').startSession()
    session.startTransaction()

    try {
        const driverId = req.user.id
        const { deliveryId } = req.params
        const { PIN } = req.body

        const delivery = await agentDeliveryModel.findOne({
            _id: deliveryId,
            driverId,
            status: 'Accepted'
        })

        if (!delivery) {
            await session.abortTransaction()
            return next({ message: 'Delivery not found', statusCode: 404 })
        }

        if (delivery.PIN !== PIN) {
            await session.abortTransaction()
            return next({ message: 'Invalid PIN', statusCode: 400 })
        }

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

        await driverModel.findByIdAndUpdate(driverId, { isAvailable: true }, { session })

        await new notificationModel({
            owner: delivery.agentId,
            ownerType: 'agents',
            title: 'Delivery Completed',
            message: `Your ${delivery.produceType} has been Delivered Successfully`,
            type: 'delivery'
        }).save({ session })

        await new notificationModel({
            owner: delivery.driverId,
            ownerType: 'drivers',
            title: 'Delivery Completed',
            message: `₦${delivery.totalFare.toLocaleString()} has been added to your wallet`,
            type: 'delivery'
        }).save({ session })

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
        return next({ message: 'something went wrong', statusCode: 500 })
    } finally {
        session.endSession()
    }
}



 // this is to calculate the estimated price for the delivery
exports.estimateDeliveryPrice = async (req, res, next) => {
    try {
        const { pickupLocation, Destination, vehicleType} = req.body

        if (!pickupLocation || !Destination || !vehicleType) {
            return next({
                message: 'pickupLocation, Destination and vehhicleId are required',
                statusCode: 400
            })
        }

        const vehicle = await vehicleModel.findById(vehicleType)
        if (!vehicle) {
            return next({ message: 'Vehicle type not found', statusCode: 404 })
        }

        const { distanceKm, duration } = await getDistance(pickupLocation, Destination)

        const totalFare = Math.round(vehicle.baseFare + vehicle.ratePerKm * distanceKm)
        const commission = Math.round((10 / 100) * totalFare)
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
        return next({ message: error.message || 'something went wrong', statusCode: 500 })
    }
}