const agentFarmerModel = require('../model/agentFarmer')
const agentModel = require('../model/agent')
const agentDeliveryModel = require('../model/agentDelivery')
const agentTransModel = require('../model/agentTransaction')
const mongoose = require('mongoose')
const agentWalletModel = require('../model/agentWallet')
const bankModel = require('../model/bankModel')

exports.agentDashboardOverview = async(req, res, next) => {
    try {
        const agentId = req.user.id

        const agent = await agentModel.findById(agentId)
        if(!agent) {
            return next({ message: 'agent not found', statusCode: 404 })
        }

        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const [
            farmersManagedCount,
            inProgressCount,
            completedThisMonthCount,
            totalSpentThisMonth,
            recentDeliveries,
            recentFarmers,
            recentRequests
        ] = await Promise.all([

            agentFarmerModel.countDocuments({ agent: agentId }),

            agentDeliveryModel.countDocuments({
                agentId,
                status: { $in: ['Pending', 'Accepted', 'In Transit'] }
            }),

            agentDeliveryModel.countDocuments({
                agentId,
                status: 'Delivered',
                updatedAt: { $gte: startOfMonth }
            }),

            agentTransModel.aggregate([
                {
                    $match: {
                        agent: new mongoose.Types.ObjectId(agentId),
                        type: 'Debit',
                        createdAt: { $gte: startOfMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]),

            // Recent delivered deliveries
            agentDeliveryModel.find({
                agentId,
                status: 'Delivered'
            })
            .populate('agentFarmerId', 'farmerFullName')
            .select('produceType pickupLocation Destination updatedAt')
            .sort({ updatedAt: -1 })
            .limit(3),

            // Recent farmers added
            agentFarmerModel.find({ agent: agentId })
                .select('farmerFullName createdAt')
                .sort({ createdAt: -1 })
                .limit(3),

            // Recent transport requests created
            agentDeliveryModel.find({ agentId })
                .select('produceType pickupLocation Destination createdAt')
                .sort({ createdAt: -1 })
                .limit(3)
        ])

            
            let recentActivity = []

            recentDeliveries.forEach(d => {
                recentActivity.push({
                    type: 'Delivery Completed',
                    title: `${d.produceType} - ${d.pickupLocation} to ${d.Destination}`,
                    date: d.updatedAt
                })
            })

            recentFarmers.forEach(f => {
                recentActivity.push({
                    type: 'New Farmer Added',
                    title: f.farmerFullName,
                    date: f.createdAt
                })
            })

        recentRequests.forEach(r => {
            recentActivity.push({
                type: 'Transport Request Created',
                title: `${r.produceType} - ${r.pickupLocation} to ${r.Destination}`,
                date: r.createdAt
            })
        })

        recentActivity = recentActivity
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3)

        res.status(200).json({
            message: 'Agent dashboard fetched successfully',
            data: {
                greeting: `Welcome ${agent.firstName} ${agent.lastName}`,
                stats: {
                    farmersManaged: farmersManagedCount,
                    inProgress: inProgressCount,
                    completedThisMonth: completedThisMonthCount,
                    totalSpentThisMonth: totalSpentThisMonth[0]?.total || 0
                },
                recentActivity
            }
        })

    } catch(error) {
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}


exports.myFarmersOverview = async(req, res, next) => {
    try {
        const agentId = req.user.id

        const [farmers, totalFarmersCount, totalDeliveriesCount, totalCommissions] = await Promise.all([

            agentFarmerModel.find({ agent: agentId })
                .sort({ createdAt: -1 }),

            agentFarmerModel.countDocuments({ agent: agentId }),

            agentDeliveryModel.countDocuments({ agentId }),

            agentDeliveryModel.aggregate([
                {
                    $match: {
                        agentId: new mongoose.Types.ObjectId(agentId),
                        status: 'Delivered'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$commission' }
                    }
                }
            ])
        ])

        const farmersWithDeliveryCount = await Promise.all(
            farmers.map(async(farmer) => {
                const deliveryCount = await agentDeliveryModel.countDocuments({
                    agentFarmerId: farmer._id
                })

                return {
                    _id: farmer._id,
                    farmerFullName: farmer.farmerFullName,
                    phoneNumber: farmer.phoneNumber,
                    farmLocation: farmer.farmLocation,
                    cropsGrown: farmer.cropsGrown,
                    deliveryCount,
                    joinedDate: farmer.createdAt
                }
            })
        )

        res.status(200).json({
            message: 'My farmers fetched successfully',
            data: {
                stats: {
                    totalFarmers: totalFarmersCount,
                    totalDeliveries: totalDeliveriesCount,
                    commissionsEarned: totalCommissions[0]?.total || 0
                },
                farmers: farmersWithDeliveryCount
            }
        })

    } catch(error) {
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}



exports.getAgentWallet = async(req, res, next) => {
    try {
        const agentId = req.user.id

        const [wallet, linkedAccounts, transactions] = await Promise.all([

            // wallet balance
            agentWalletModel.findOne({ agent: agentId }),

            // linked bank accounts
            bankModel.find({ agent: agentId }),

            // transaction history
            agentTransModel.find({ agent: agentId })
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



//track Delivery
exports.getSingleAgentDelivery = async (req, res, next) => {
    try {
        const agentId = req.user.id
        const { deliveryId } = req.params

        const delivery = await agentDeliveryModel.findOne({
            _id: deliveryId,
            agentId
        })
        .populate('agentFarmerId', 'farmerFullName phoneNumber farmLocation')
        .populate('driverId', 'firstName lastName phoneNumber')
        .populate('vehicleType', 'vehicleType')

        if (!delivery) {
            return next({ message: 'Delivery not found', statusCode: 404 })
        }

        // only show PIN if delivery is active
        const showPin = ['Accepted', 'In Transit'].includes(delivery.status)

        res.status(200).json({
            message: 'Delivery fetched successfully',
            data: {
                trackingId: delivery.trackingId,
                status: delivery.status,
                estimatedDuration: delivery.estimatedDuration,
               
                paymentStatus: delivery.status === 'Delivered' 
                    ? 'Released' 
                    : 'Payment Secured with Escrow',
                driver: delivery.driverId ? {
                    name: `${delivery.driverId.firstName} ${delivery.driverId.lastName}`,
                    phone: delivery.driverId.phoneNumber,
                    vehicleType: delivery.vehicleType?.vehicleType
                } : null,
                customer: {
                    // customersName: delivery.customersName ← add when ready
                    details: delivery.customersDetails
                },
                pin: showPin ? delivery.PIN : null,
                deliveryDetails: {
                    produce: delivery.produceType,
                    quantity: delivery.quantity,
                    pickupLocation: delivery.pickupLocation,
                    destination: delivery.Destination,
                    agreedFee: `₦${delivery.totalFare?.toLocaleString()}`,
                    farmer: delivery.agentFarmerId?.farmerFullName
                }
            }
        })

    } catch (error) {
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}

// ============================================
// GET ALL AGENT DELIVERIES (Active Deliveries screen)
// ============================================
exports.getAllAgentDeliveries = async (req, res, next) => {
    try {
        const agentId = req.user.id

        const [
            totalActive,
            inTransit,
            completed,
            pending,
            deliveries
        ] = await Promise.all([
            // total active (not delivered)
            agentDeliveryModel.countDocuments({
                agentId,
                status: { $in: ['Pending', 'Accepted', 'In Transit'] }
            }),

            // in transit count
            agentDeliveryModel.countDocuments({
                agentId,
                status: 'In Transit'
            }),

            // completed count
            agentDeliveryModel.countDocuments({
                agentId,
                status: 'Delivered'
            }),

            // pending count
            agentDeliveryModel.countDocuments({
                agentId,
                status: 'Pending'
            }),

            // all deliveries
            agentDeliveryModel.find({ agentId })
                .populate('agentFarmerId', 'farmerFullName')
                .populate('driverId', 'firstName lastName')
                .populate('vehicleType', 'vehicleType')
                .sort({ createdAt: -1 })
        ])

        const formattedDeliveries = deliveries.map(d => ({
            _id: d._id,
            trackingId: d.trackingId,
            status: d.status,
            produceType: d.produceType,
            quantity: d.quantity,
            pickupLocation: d.pickupLocation,
            destination: d.Destination,
            estimatedDuration: d.estimatedDuration,
            totalFare: `₦${d.totalFare?.toLocaleString()}`,
            farmer: d.agentFarmerId?.farmerFullName || 'Unknown',
            driver: d.driverId 
                ? `${d.driverId.firstName} ${d.driverId.lastName}`
                : 'Not assigned',
            paymentStatus: d.status === 'Delivered'
                ? 'Released'
                : 'Payment Secured with Escrow'
        }))

        res.status(200).json({
            message: 'Deliveries fetched successfully',
            data: {
                stats: {
                    totalActive,
                    inTransit,
                    completed,
                    pending
                },
                deliveries: formattedDeliveries
            }
        })

    } catch (error) {
        console.log(error)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}