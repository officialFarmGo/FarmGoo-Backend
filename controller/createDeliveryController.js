const deliveryModel = require("../model/delivery");
const vehicleModel = require("../model/vehicleType");
const farmerWalletModel = require("../model/farmerWallet");
const driverWalletModel = require("../model/driverWallet");
const farmModel = require("../model/farm");
const farmerTransactionModel = require("../model/farmerTrans");
const driverTransactionModel = require("../model/driverTransactionModel");
const driverModel = require("../model/driver");
const axios = require("axios");
const brevo = require("../utils/brevo");
const brevoBulk = require('../utils/brevoBulk') 


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
    const existing = await deliveryModel.findOne({ trackingId });
    if (!existing) isUnique = true;
  }

  return trackingId;
};

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
      pickupSchedule,
    } = req.body;

    const user = await farmModel.findById(userId);
    if (!user) {
      return next({
        message: "user not found",
        statusCode: 404,
      });
    }

    const vehicle = await vehicleModel.findById(vehhicleId);

    if (!vehicle) {
      return next({ message: "Vehicle type not found", statusCode: 404 });
    }

    const { distanceKm, duration } = await getDistance(
      AddressOrpickUpLocation,
      Destination,
    );

    const totalFare = vehicle.baseFare + vehicle.ratePerKm * distanceKm;
    const newCommission = (10 / 100) * totalFare;
    const amount = totalFare + newCommission;

    const wallet = await farmerWalletModel.findOne({ farmer: userId });

    if (!wallet) {
      return next({ message: "Wallet not found", statusCode: 404 });
    }

    if (wallet.availableBalance < totalFare) {
        return next({
            message: `Insufficient wallet balance. Required: ₦${totalFare.toFixed(2)}, Available: ₦${wallet.availableBalance.toFixed(2)}`,
            statusCode: 400
        })
    }

    const trackingId = await generateTrackingId();

    const delivery = await deliveryModel.create({
      farmerId: user._id,
      trackingId,
      productType,
      quantity,
      weight,
      amount,
      AddressOrpickUpLocation,
      landMarkToAddressForPickup,
      Destination,
      customersPhoneNumber,
      CustomersOtherNumber,
      pickupSchedule,
      vehhicleId: vehicle._id,
      totalFare,
    });

    const drivers = await driverModel.find({
      kycVerified: true,
      isAvailable: true,
    });

    // send bulk email


    res.status(201).json({
      message: "Delivery request created successfully",
      data: {
        delivery,
        estimatedDuration: duration,
        totalFare: `₦${totalFare.toFixed(2)}`,
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

        const delivery = await deliveryModel.findOneAndUpdate(
            { _id: deliveryId, status: 'Pending' },
            { status: 'Accepted', driver: driverId },
            { new: true, session }
        )

        if (!delivery) {
            await session.abortTransaction()
            return next({
                message: 'Delivery not available or already accepted by another driver',
                statusCode: 400
            })
        }

        const farmerWallet = await farmerWalletModel.findOneAndUpdate(
            {
                farmer: delivery.requestedBy,
                availableBalance: { $gte: delivery.totalFare }
            },
            {
                $inc: {
                    availableBalance: -delivery.totalFare,
                    escrowBalance: +delivery.totalFare
                }
            },
            { new: true, session }
        )

        if (!farmerWallet) {
            await session.abortTransaction()
            return next({
                message: 'Farmer has insufficient balance',
                statusCode: 400
            })
        }

        await farmerTransactionModel.create([{
            farmer: delivery.requestedBy,
            wallet: farmerWallet._id,
            delivery: delivery._id,
            amount: delivery.totalFare,
            type: 'Debit',
            description: `Payment held for delivery ${delivery.trackingId}`,
            status: 'Successful'
        }], { session })

        await driverModel.findByIdAndUpdate(
            driverId,
            { isAvailable: false },
            { session }
        )

        await session.commitTransaction()

        res.status(200).json({
            message: 'Delivery accepted successfully',
            data: delivery
        })

    } catch (error) {
        await session.abortTransaction()
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    } finally {
        session.endSession()
    }
}

exports.rejectDelivery = async (req, res, next) => {
    try {
        const { deliveryId } = req.params

        const delivery = await deliveryModel.findById(deliveryId)

        if (!delivery) {
            return next({ message: 'Delivery not found', statusCode: 404 })
        }

        res.status(200).json({
            message: 'Delivery rejected',
        })

    } catch (error) {
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}

exports.completeDelivery = async (req, res, next) => {
    const session = await require('mongoose').startSession()
    session.startTransaction()

    try {
        const driverId = req.user.id
        const { deliveryId } = req.params

        const delivery = await deliveryModel.findOne({
            _id: deliveryId,
            driver: driverId,
            status: 'In Transit'
        })

        if (!delivery) {
            return next({ message: 'Delivery not found', statusCode: 404 })
        }

        // 1. update delivery status
        await deliveryModel.findByIdAndUpdate(
            deliveryId,
            { status: 'Delivered' },
            { session }
        )

        await farmerWalletModel.findOneAndUpdate(
            { farmer: delivery.requestedBy },
            { $inc: { escrowBalance: -delivery.totalFare } },
            { session }
        )

        const driverWallet = await driverWalletModel.findOneAndUpdate(
            { driver: driverId },
            { $inc: { availableBalance: +delivery.totalFare } },
            { new: true, session }
        )

        await driverTransactionModel.create([{
            driver: driverId,
            wallet: driverWallet._id,
            delivery: delivery._id,
            amount: delivery.totalFare,
            type: 'Credit',
            description: `Payment received for delivery ${delivery.trackingId}`,
            status: 'Successful'
        }], { session })

        await driverModel.findByIdAndUpdate(
            driverId,
            { isAvailable: true },
            { session }
        )

        await session.commitTransaction()

        res.status(200).json({
            message: 'Delivery completed successfully',
            data: {
                trackingId: delivery.trackingId,
                amountEarned: `₦${delivery.totalFare.toFixed(2)}`
            }
        })

    } catch (error) {
        await session.abortTransaction()
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    } finally {
        session.endSession()
    }
}
