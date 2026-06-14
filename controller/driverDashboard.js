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




/**
 * GET /driver/deliveries
 *
 * Returns:
 *  - stats: { active, completed, avgETA }
 *  - activeDeliveries[]   (status: Accepted | In Transit)
 *  - completedDeliveries[] (status: Delivered)
 */
exports.getDriverDeliveries = async (req, res, next) => {
  try {
    const driverId = req.user.id;

    const driver = await driverModel.findById(driverId);
    if (!driver) {
      return next({ message: "Driver not found", statusCode: 404 });
    }

    const [
      activeCount,
      completedCount,
      avgETAResult,
      activeDeliveries,
      completedDeliveries,
    ] = await Promise.all([
      // 1. Active deliveries count
      deliveryModel.countDocuments({
        driverId,
        status: { $in: ["Accepted", "In Transit"] },
      }),

      // 2. Completed deliveries count
      deliveryModel.countDocuments({
        driverId,
        status: "Delivered",
      }),

      // 3. Average ETA — aggregate estimatedDuration of active deliveries.
      //    estimatedDuration is stored as a Google Maps duration string e.g. "2 hours 30 mins".
      //    We parse the string into minutes inside the aggregation using $regexFind workaround,
      //    but since MongoDB can't regex-parse numbers natively we do it in JS after fetching
      //    the raw durations (see below — this aggregate just pulls the values).
      deliveryModel
        .find(
          { driverId, status: { $in: ["Accepted", "In Transit"] } },
          { estimatedDuration: 1 }
        )
        .lean(),

      // 4. Active deliveries list
      deliveryModel
        .find({
          driverId,
          status: { $in: ["Accepted", "In Transit"] },
        })
        .select(
          "trackingId productType quantity weight status " +
            "AddressOrpickUpLocation Destination totalFare " +
            "estimatedDuration pickupSchedule farmerId"
        )
        .populate("farmerId", "firstName lastName phoneNumber")
        .sort({ createdAt: -1 })
        .lean(),

      // 5. Completed deliveries list
      deliveryModel
        .find({
          driverId,
          status: "Delivered",
        })
        .select(
          "trackingId productType quantity weight status " +
            "AddressOrpickUpLocation Destination totalFare " +
            "estimatedDuration farmerId updatedAt"
        )
        .populate("farmerId", "firstName lastName")
        .sort({ updatedAt: -1 })
        .limit(3)
        .lean(),
    ]);

    // --- Compute average ETA from duration strings ---
    // Google Maps returns strings like "1 hour", "2 hours", "45 mins", "1 hour 30 mins"
    const parseDurationToMinutes = (str = "") => {
      let minutes = 0;
      const hourMatch = str.match(/(\d+)\s*hour/);
      const minMatch = str.match(/(\d+)\s*min/);
      if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
      if (minMatch) minutes += parseInt(minMatch[1]);
      return minutes;
    };

    let avgETA = "N/A";
    if (avgETAResult.length > 0) {
      const totalMinutes = avgETAResult.reduce(
        (sum, d) => sum + parseDurationToMinutes(d.estimatedDuration),
        0
      );
      const avgMinutes = totalMinutes / avgETAResult.length;
      const avgHours = avgMinutes / 60;
      avgETA = `~${avgHours % 1 === 0 ? avgHours : avgHours.toFixed(1)}h`;
    }

    // --- Format completed deliveries to match Figma card design ---
    // Card shows: product, badges (Delivered + Payment Released), quantity + trackingId,
    // pickup → destination, farmer name, completed timestamp, earned amount
    const formatCompletedAt = (date) => {
      const now = new Date();
      const d = new Date(date);
      const isToday = d.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();
      const time = d.toLocaleTimeString("en-NG", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      if (isToday) return `Today, ${time}`;
      if (isYesterday) return `Yesterday, ${time}`;
      return `${d.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}, ${time}`;
    };

    const shapedCompletedDeliveries = completedDeliveries.map((d) => ({
      deliveryId: d._id,
      trackingId: d.trackingId,
      productType: d.productType,
      quantity: d.quantity,
      weight: d.weight,
      status: d.status,                    // "Delivered"
      paymentStatus: "Payment Released",   // all Delivered docs have payment released
      pickup: d.AddressOrpickUpLocation,
      destination: d.Destination,
      farmer: d.farmerId
        ? `${d.farmerId.firstName} ${d.farmerId.lastName}`
        : "Unknown Farmer",
      completedAt: formatCompletedAt(d.updatedAt),
      earned: `₦${d.totalFare?.toLocaleString()}`,
      earnedRaw: d.totalFare,
    }));

    return res.status(200).json({
      message: "Driver deliveries fetched successfully",
      data: {
        stats: {
          active: activeCount,
          completed: completedCount,
          avgETA,
        },
        activeDeliveries,
        completedDeliveries: shapedCompletedDeliveries,
      },
    });
  } catch (error) {
    console.log(error);
    return next({ message: "Something went wrong", statusCode: 500 });
  }
};





exports.getAvailableJobs = async (req, res, next) => {
  try {
    const driverId = req.user.id;

    const driver = await driverModel.findById(driverId);
    if (!driver) {
      return next({ message: "Driver not found", statusCode: 404 });
    }

    // Gate: check if the driver is currently occupied
    const activeDeliveryCount = await deliveryModel.countDocuments({
      driverId,
      status: { $in: ["Accepted", "In Transit"] },
    });

    if (activeDeliveryCount > 0) {
      return res.status(200).json({
        message: "Available jobs fetched",
        data: {
          isAvailable: false,
          message: "Complete your current delivery to view available jobs.",
          totalJobs: 0,
          jobs: [],
        },
      });
    }

    // Driver is free — fetch all unclaimed pending deliveries
    const jobs = await deliveryModel
      .find({
        status: "Pending",
        driverId: { $exists: false }, // no driver has accepted yet
      })
      .select(
        "trackingId productType quantity weight " +
          "AddressOrpickUpLocation landMarkToAddressForPickup " +
          "Destination totalFare estimatedDuration " +
          "pickupSchedule farmerId vehhicleId createdAt"
      )
      .populate("farmerId", "firstName lastName phoneNumber townOrVillage")
      .populate("vehhicleId", "vehicleType baseFare ratePerKm")
      .sort({ createdAt: -1 })
      .lean();

    // Shape each job for the frontend card
    const shapedJobs = jobs.map((job) => ({
      deliveryId: job._id,
      trackingId: job.trackingId,
      productType: job.productType,
      quantity: job.quantity,
      weight: job.weight,
      pickup: {
        address: job.AddressOrpickUpLocation,
        landmark: job.landMarkToAddressForPickup,
      },
      destination: job.Destination,
      estimatedPayout: `₦${job.totalFare?.toLocaleString()}`,
      estimatedDuration: job.estimatedDuration || "N/A",
      pickupSchedule: job.pickupSchedule,
      vehicleRequired: job.vehhicleId?.vehicleType || "N/A",
      farmer: job.farmerId
        ? {
            name: `${job.farmerId.firstName} ${job.farmerId.lastName}`,
            phone: job.farmerId.phoneNumber,
            location: job.farmerId.townOrVillage,
          }
        : null,
      postedAt: job.createdAt,
    }));

    return res.status(200).json({
      message: "Available jobs fetched successfully",
      data: {
        isAvailable: true,
        totalJobs: shapedJobs.length,
        jobs: shapedJobs,
      },
    });
  } catch (error) {
    console.log(error);
    return next({ message: "Something went wrong", statusCode: 500 });
  }
};