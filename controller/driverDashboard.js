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
const agentDeliveryModel = require('../model/agentDelivery')




exports.driverDashboard = async (req, res, next) => {
    try {
        const driverId = req.user.id

        const driver = await driverModel.findById(driverId)
        if (!driver) {
            return next({ message: 'driver not found', statusCode: 404 })
        }

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const startOfWeek = new Date()
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
        startOfWeek.setHours(0, 0, 0, 0)

        const [
            farmerActiveDeliveries,
            agentActiveDeliveries,
            todaysEarnings,
            farmerCompletedThisWeek,
            agentCompletedThisWeek,
            driverWallet,
            driverKyc
        ] = await Promise.all([

            deliveryModel.find({ driverId, status: { $in: ['Accepted', 'In Transit'] } })
                .select('productType weight quantity totalFare trackingId status AddressOrpickUpLocation Destination estimatedDuration')
                .sort({ createdAt: -1 }),

            agentDeliveryModel.find({ driverId, status: { $in: ['Accepted', 'In Transit'] } })
                .select('produceType quantity totalFare trackingId status pickupLocation Destination estimatedDuration')
                .sort({ createdAt: -1 }),

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

            deliveryModel.countDocuments({ driverId, status: 'Delivered', updatedAt: { $gte: startOfWeek } }),
            agentDeliveryModel.countDocuments({ driverId, status: 'Delivered', updatedAt: { $gte: startOfWeek } }),

            driverWalletModel.findOne({ driver: driverId }),

            driverKycModel.findOne({ driver: driverId })
                .populate('vehicleType', 'vehicleType')
        ])

        const allActiveDeliveries = [
            ...farmerActiveDeliveries,
            ...agentActiveDeliveries.map(d => ({
                ...d.toObject(),
                productType: d.produceType,
                AddressOrpickUpLocation: d.pickupLocation,
                source: 'agent'
            }))
        ]

        const activeDeliveriesCount = allActiveDeliveries.length
        const completedThisWeekCount = farmerCompletedThisWeek + agentCompletedThisWeek

        let availableJobsCount = 0
        let availableJobsSection = {
            show: false,
            message: "Complete your current delivery to browse new jobs",
            jobs: []
        }

        if (driver.isAvailable) {
            const [farmerJobs, agentJobs] = await Promise.all([
                deliveryModel.find({ status: 'Pending', driverId: { $exists: false } })
                    .select('productType weight quantity totalFare AddressOrpickUpLocation Destination')
                    .sort({ createdAt: -1 })
                    .limit(5),

                agentDeliveryModel.find({ status: 'Pending', driverId: { $exists: false } })
                    .select('produceType quantity totalFare pickupLocation Destination')
                    .sort({ createdAt: -1 })
                    .limit(5)
            ])

            const normalizedAgentJobs = agentJobs.map(d => ({
                ...d.toObject(),
                productType: d.produceType,
                AddressOrpickUpLocation: d.pickupLocation,
                source: 'agent'
            }))

            const allJobs = [...farmerJobs, ...normalizedAgentJobs]
            availableJobsCount = allJobs.length
            availableJobsSection = { show: true, jobs: allJobs }
        }

        res.status(200).json({
            message: 'Driver dashboard fetched successfully',
            data: {
                greeting: `${driver.firstName} ${driver.lastName}`,
                stats: {
                    availableJobs: availableJobsCount,
                    activeDeliveries: activeDeliveriesCount,
                    todaysEarnings: todaysEarnings[0]?.total || 0
                },
                activeDeliveries: allActiveDeliveries,
                availableJobsSection,
                completedThisWeek: completedThisWeekCount,
                walletBalance: driverWallet?.availableBalance || 0,
                vehicleStatus: {
                    status: driver.isAvailable ? 'Active & Ready' : 'On Delivery',
                    vehicleType: driverKyc?.vehicleType?.vehicleType || 'Not set'
                }
            }
        })

    } catch (error) {
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}




exports.getDriverWallet = async (req, res, next) => {
    try {
        const driverId = req.user.id

        const [wallet, linkedAccounts, transactions] = await Promise.all([
            driverWalletModel.findOne({ driver: driverId }),
            bankModel.find({ driver: driverId }),
            driveTransModel.find({ driver: driverId })
                .sort({ createdAt: -1 })
                .select('amount type status createdAt description')
                .limit(5)
        ])

        if (!wallet) {
            return next({ message: 'Wallet not found', statusCode: 404 })
        }

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

    } catch (error) {
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}




exports.getDriverDeliveries = async (req, res, next) => {
    try {
        const driverId = req.user.id

        const driver = await driverModel.findById(driverId)
        if (!driver) {
            return next({ message: 'Driver not found', statusCode: 404 })
        }

        const [
            farmerActiveCount,
            agentActiveCount,
            farmerCompletedCount,
            agentCompletedCount,
            farmerActiveDeliveries,
            agentActiveDeliveries,
            farmerCompletedDeliveries,
            agentCompletedDeliveries,
        ] = await Promise.all([

            deliveryModel.countDocuments({ driverId, status: { $in: ['Accepted', 'In Transit'] } }),
            agentDeliveryModel.countDocuments({ driverId, status: { $in: ['Accepted', 'In Transit'] } }),
            deliveryModel.countDocuments({ driverId, status: 'Delivered' }),
            agentDeliveryModel.countDocuments({ driverId, status: 'Delivered' }),

            deliveryModel.find({ driverId, status: { $in: ['Accepted', 'In Transit'] } })
                .select('trackingId productType quantity weight status AddressOrpickUpLocation Destination totalFare estimatedDuration pickupSchedule farmerId')
                .populate('farmerId', 'firstName lastName phoneNumber')
                .sort({ createdAt: -1 }).lean(),

            agentDeliveryModel.find({ driverId, status: { $in: ['Accepted', 'In Transit'] } })
                .select('trackingId produceType quantity status pickupLocation Destination totalFare estimatedDuration agentId')
                .populate('agentId', 'firstName lastName phoneNumber')
                .sort({ createdAt: -1 }).lean(),

            deliveryModel.find({ driverId, status: 'Delivered' })
                .select('trackingId productType quantity weight status AddressOrpickUpLocation Destination totalFare estimatedDuration farmerId updatedAt')
                .populate('farmerId', 'firstName lastName')
                .sort({ updatedAt: -1 }).limit(3).lean(),

            agentDeliveryModel.find({ driverId, status: 'Delivered' })
                .select('trackingId produceType quantity status pickupLocation Destination totalFare updatedAt agentId')
                .populate('agentId', 'firstName lastName')
                .sort({ updatedAt: -1 }).limit(3).lean()
        ])

        const activeCount = farmerActiveCount + agentActiveCount
        const completedCount = farmerCompletedCount + agentCompletedCount

        const normalizedAgentActive = agentActiveDeliveries.map(d => ({
            ...d,
            productType: d.produceType,
            AddressOrpickUpLocation: d.pickupLocation,
            source: 'agent'
        }))

        const allActiveDeliveries = [...farmerActiveDeliveries, ...normalizedAgentActive]

        // avg ETA across all active
        const parseDurationToMinutes = (str = '') => {
            let minutes = 0
            const hourMatch = str.match(/(\d+)\s*hour/)
            const minMatch = str.match(/(\d+)\s*min/)
            if (hourMatch) minutes += parseInt(hourMatch[1]) * 60
            if (minMatch) minutes += parseInt(minMatch[1])
            return minutes
        }

        let avgETA = 'N/A'
        if (allActiveDeliveries.length > 0) {
            const totalMinutes = allActiveDeliveries.reduce(
                (sum, d) => sum + parseDurationToMinutes(d.estimatedDuration), 0
            )
            const avgMinutes = totalMinutes / allActiveDeliveries.length
            const avgHours = avgMinutes / 60
            avgETA = `~${avgHours % 1 === 0 ? avgHours : avgHours.toFixed(1)}h`
        }

        // merge completed, re-sort, take top 3
        const normalizedAgentCompleted = agentCompletedDeliveries.map(d => ({
            ...d,
            productType: d.produceType,
            AddressOrpickUpLocation: d.pickupLocation,
            source: 'agent'
        }))

        const allCompleted = [...farmerCompletedDeliveries, ...normalizedAgentCompleted]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 3)

        const formatCompletedAt = (date) => {
            const now = new Date()
            const d = new Date(date)
            const isToday = d.toDateString() === now.toDateString()
            const yesterday = new Date(now)
            yesterday.setDate(now.getDate() - 1)
            const isYesterday = d.toDateString() === yesterday.toDateString()
            const time = d.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', hour12: true })
            if (isToday) return `Today, ${time}`
            if (isYesterday) return `Yesterday, ${time}`
            return `${d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}, ${time}`
        }

        const shapedCompletedDeliveries = allCompleted.map(d => ({
            deliveryId: d._id,
            trackingId: d.trackingId,
            productType: d.productType,
            quantity: d.quantity,
            weight: d.weight,
            status: d.status,
            paymentStatus: 'Payment Released',
            pickup: d.AddressOrpickUpLocation,
            destination: d.Destination,
            completedAt: formatCompletedAt(d.updatedAt),
            earned: `₦${d.totalFare?.toLocaleString()}`,
            earnedRaw: d.totalFare,
            source: d.source || 'farmer'
        }))

        return res.status(200).json({
            message: 'Driver deliveries fetched successfully',
            data: {
                stats: {
                    active: activeCount,
                    completed: completedCount,
                    avgETA
                },
                activeDeliveries: allActiveDeliveries,
                completedDeliveries: shapedCompletedDeliveries
            }
        })

    } catch (error) {
        console.log(error)
        return next({ message: 'Something went wrong', statusCode: 500 })
    }
}




exports.getAvailableJobs = async (req, res, next) => {
    try {
        const driverId = req.user.id

        const driver = await driverModel.findById(driverId)
        if (!driver) {
            return next({ message: 'Driver not found', statusCode: 404 })
        }

        const [farmerActiveCount, agentActiveCount] = await Promise.all([
            deliveryModel.countDocuments({ driverId, status: { $in: ['Accepted', 'In Transit'] } }),
            agentDeliveryModel.countDocuments({ driverId, status: { $in: ['Accepted', 'In Transit'] } })
        ])

        if (farmerActiveCount + agentActiveCount > 0) {
            return res.status(200).json({
                message: 'Available jobs fetched',
                data: {
                    isAvailable: false,
                    message: 'Complete your current delivery to view available jobs.',
                    totalJobs: 0,
                    jobs: []
                }
            })
        }

        const [farmerJobs, agentJobs] = await Promise.all([
            deliveryModel.find({
                status: 'Pending',
                driverId: { $exists: false },
                rejectedBy: { $nin: [driverId] }
            })
            .select('trackingId productType quantity weight AddressOrpickUpLocation landMarkToAddressForPickup Destination totalFare estimatedDuration pickupSchedule farmerId vehhicleId createdAt')
            .populate('farmerId', 'firstName lastName phoneNumber townOrVillage')
            .populate('vehhicleId', 'vehicleType baseFare ratePerKm')
            .sort({ createdAt: -1 }).lean(),

            agentDeliveryModel.find({
                status: 'Pending',
                driverId: { $exists: false },
                rejectedBy: { $nin: [driverId] }
            })
            .select('trackingId produceType quantity pickupLocation Destination totalFare estimatedDuration vehicleType agentId createdAt')
            .populate('vehicleType', 'vehicleType baseFare ratePerKm')
            .populate('agentId', 'firstName lastName phoneNumber')
            .sort({ createdAt: -1 }).lean()
        ])

        const normalizedFarmerJobs = farmerJobs.map(job => ({
            deliveryId: job._id,
            trackingId: job.trackingId,
            productType: job.productType,
            quantity: job.quantity,
            weight: job.weight,
            pickup: {
                address: job.AddressOrpickUpLocation,
                landmark: job.landMarkToAddressForPickup
            },
            destination: job.Destination,
            estimatedPayout: `₦${job.totalFare?.toLocaleString()}`,
            estimatedDuration: job.estimatedDuration || 'N/A',
            pickupSchedule: job.pickupSchedule,
            vehicleRequired: job.vehhicleId?.vehicleType || 'N/A',
            postedAt: job.createdAt,
            source: 'farmer'
        }))

        const normalizedAgentJobs = agentJobs.map(job => ({
            deliveryId: job._id,
            trackingId: job.trackingId,
            productType: job.produceType,
            quantity: job.quantity,
            weight: null,
            pickup: {
                address: job.pickupLocation,
                landmark: null
            },
            destination: job.Destination,
            estimatedPayout: `₦${job.totalFare?.toLocaleString()}`,
            estimatedDuration: job.estimatedDuration || 'N/A',
            pickupSchedule: null,
            vehicleRequired: job.vehicleType?.vehicleType || 'N/A',
            postedAt: job.createdAt,
            source: 'agent'
        }))

        const allJobs = [...normalizedFarmerJobs, ...normalizedAgentJobs]
            .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))

        return res.status(200).json({
            message: 'Available jobs fetched successfully',
            data: {
                isAvailable: true,
                totalJobs: allJobs.length,
                jobs: allJobs
            }
        })

    } catch (error) {
        console.log(error)
        return next({ message: 'Something went wrong', statusCode: 500 })
    }
}




exports.getJobDetail = async (req, res, next) => {
    try {
        const driverId = req.user.id
        const { deliveryId } = req.params

        const driverKyc = await driverKycModel.findOne({ driver: driverId })
            .populate('vehicleType', 'vehicleType')
        if (!driverKyc) {
            return next({ message: 'Complete your KYC to view job details', statusCode: 403 })
        }

        const delivery = await deliveryModel.findOne({
            _id: deliveryId,
            status: 'Pending',
            driverId: { $exists: false },
            vehhicleId: driverKyc.vehicleType._id,
            rejectedBy: { $nin: [driverId] }
        })
        .populate('farmerId', 'firstName lastName email phoneNumber createdAt kycVerified')
        .populate('vehhicleId', 'vehicleType')
        .lean()

        // if not a farmer delivery, check agent delivery
        const agentDelivery = !delivery
            ? await agentDeliveryModel.findOne({
                _id: deliveryId,
                status: 'Pending',
                driverId: { $exists: false },
                vehicleType: driverKyc.vehicleType._id,
                rejectedBy: { $nin: [driverId] }
            })
            .populate('agentId', 'firstName lastName email phoneNumber createdAt kycVerified')
            .populate('vehicleType', 'vehicleType')
            .lean()
            : null

        if (!delivery && !agentDelivery) {
            return next({ message: 'Job not available', statusCode: 404 })
        }

        const job = delivery || agentDelivery
        const isFarmerJob = !!delivery

        const postedAgo = (() => {
            const diffMs = Date.now() - new Date(job.createdAt).getTime()
            const diffMins = Math.floor(diffMs / 60000)
            if (diffMins < 60) return `Posted ${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
            const diffHours = Math.floor(diffMins / 60)
            if (diffHours < 24) return `Posted ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
            const diffDays = Math.floor(diffHours / 24)
            return `Posted ${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
        })()

        const owner = isFarmerJob ? job.farmerId : job.agentId

        const memberSince = new Date(owner.createdAt).toLocaleDateString('en-NG', {
            month: 'short',
            year: 'numeric'
        })

        const ownerTotalDeliveries = isFarmerJob
            ? await deliveryModel.countDocuments({ farmerId: owner._id, status: 'Delivered' })
            : await agentDeliveryModel.countDocuments({ agentId: owner._id, status: 'Delivered' })

        const pickupDate = job.pickupSchedule?.date
            ? new Date(job.pickupSchedule.date).toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' })
            : null
        const pickupTime = job.pickupSchedule?.time || null

        return res.status(200).json({
            message: 'Job detail fetched successfully',
            data: {
                deliveryId: job._id,
                trackingId: job.trackingId,
                source: isFarmerJob ? 'farmer' : 'agent',

                productType: isFarmerJob ? job.productType : job.produceType,
                quantity: job.quantity,
                weight: job.weight || null,
                estimatedPayout: `₦${job.totalFare?.toLocaleString()}`,
                estimatedPayoutRaw: job.totalFare,
                escrowNote: `The ${isFarmerJob ? 'farmer' : 'agent'} has deposited ₦${job.totalFare?.toLocaleString()} into escrow. Payment will be automatically released to your wallet upon successful delivery confirmation.`,

                route: {
                    pickup: {
                        address: isFarmerJob ? job.AddressOrpickUpLocation : job.pickupLocation,
                        landmark: job.landMarkToAddressForPickup || null
                    },
                    destination: { address: job.Destination },
                    estimatedDuration: job.estimatedDuration || 'N/A'
                },

                deliveryDetails: {
                    vehicleTypeRequired: isFarmerJob ? job.vehhicleId?.vehicleType : job.vehicleType?.vehicleType || 'N/A',
                    cargoWeight: job.weight ? `${job.quantity}${job.weight}` : job.quantity,
                    riskLevel: 'Low'
                },

                owner: {
                    name: `${owner.firstName} ${owner.lastName}`,
                    phone: owner.phoneNumber,
                    isVerified: owner.kycVerified,
                    totalDeliveries: ownerTotalDeliveries,
                    memberSince,
                    type: isFarmerJob ? 'farmer' : 'agent'
                },

                postedAgo
            }
        })

    } catch (error) {
        console.log(error)
        return next({ message: 'Something went wrong', statusCode: 500 })
    }
}




exports.getOneDriver = async (req, res, next) => {
    try {
        const driverId = req.user.id

        const driver = await driverModel.findById(driverId)
        if (!driver) {
            return next({ message: 'driver not found', statusCode: 404 })
        }

        res.status(200).json({
            message: 'gotten one driver',
            data: driver
        })

    } catch (error) {
        console.log(error)
        return next({ message: error.message, statusCode: 500 })
    }
}
