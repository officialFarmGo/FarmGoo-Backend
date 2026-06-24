const farmerModel = require('../model/farm')
const driverModel = require('../model/driver')

const paymentModel = require('../model/payment')

const {nigerianBanks} = require('../utils/bankNamesAndCodes')

const otpGenerator = require('otp-generator')
const { response } = require('express')
const { default: axios } = require('axios')
const farmModel = require('../model/farm')
const agentModel = require('../model/agent')
const farmWalletModel = require('../model/farmerWallet')
const agentWalletModel = require('../model/agentWallet')
const driverWalletModel = require('../model/driverWallet')
const farmTransModel = require("../model/farmerTrans");
const driveTransModel = require("../model/driverTransactionModel");
const agentTransModel = require('../model/agentTransaction')
const notificationModel = require('../model/notification')


exports.initializePayment = async(req, res, next) =>{
    try{
        const {id} = req.user
        const userRole  = req.user.role
        const {receiverId} = req.params
        const {amount} = req.body

        let user 
        if(userRole === 'farmer'){
             user = await farmerModel.findById(id)
        }
        else if(userRole === 'driver'){
             user = await driverModel.findById(id)
        }
        else if(userRole === 'agent'){
             user = await agentModel.findById(id)
        }

        if(!user){
            return next({
                message: 'user not found',
                statusCode: 404
            })
        }
        
        const ownerType = userRole === 'farmer'? 'farmers': userRole === 'driver'? 'drivers': 'agents'

        const redirectUrlMap = {
            farmer: 'https://farmgoo.vercel.app/farmer/dashboard/deposit-success',
            agent: 'https://farmgoo.vercel.app/agent/dashboard/deposit-success',
            driver: 'https://farmgoo.vercel.app/driver/login#login'
        }

         const redirectUrl = redirectUrlMap[userRole] || 'https://farmgoo.vercel.app/login#login'

        let receiver;
        let receiveOwnerType;

        if(receiverId){
             const [farmerReceiver, driverReciever, agentReciever] = await Promise.all([
            farmModel.findById(receiverId),
            driverModel.findById(receiverId),
            agentModel.findById(receiverId)
        ])

         receiver = farmerReceiver || driverReciever || agentReciever
         receiveOwnerType = farmerReceiver ? 'farmers' : driverReciever ? 'drivers' : 'agents'

        if(!receiver){
            return next({
                message: 'reciever"s account not found',
                statusCode: 404
            })
        }  
        }

       

        const ref = otpGenerator.generate(6, {upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false})
        const reference = `FRG-${ref}`

    
       const payload = {
        amount,
        reference,
        currency: 'NGN',
        customer: {
            email: user.email,
            name:`${user.firstName} ${user.lastName}`
        },
        redirect_url: redirectUrl 
       }

       const response = await axios.post(process.env.kora_initialize, payload, {
        headers: {
            Authorization: `Bearer ${process.env.KORA_API_KEY}`
        }
       })

       if(receiverId){
        const reciveerPayment = new paymentModel({
            owner: id,
            ownerType,
            receiver,
            ReceiverType: receiveOwnerType,
            reference,
            amount: payload.amount
        })
        await reciveerPayment.save()
       }
       else{
       const newPayment = new paymentModel({
        owner: id,
        ownerType,
         reference,
        amount: payload.amount
       })

       await newPayment.save()
    }
       res.status(200).json({
        message: 'payment initiated successfully',
        data: response.data?.data,
        userId: id
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




exports.verifyPayment = async(req, res, next) =>{
    try{
        const {reference} = req.query
        const {data} = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.KORA_API_KEY}`
            }
        })

        const payment = await paymentModel.findOne({reference})
        if(!payment){
            return next({
                message: 'payment not found',
                statusCode: 404
            })
        }


        if(data?.status === true && data?.data?.status === 'success'){
             payment.status = data?.data.status;
               await payment.save()

        if(!payment.receiver){
            let user
            if(payment.ownerType === 'farmers'){
                user = await farmWalletModel.findOne({farmer: payment.owner})
            }
            else if(payment.ownerType === 'agents'){
                user = await agentWalletModel.findOne({agent: payment.owner})
            }
            else if(payment.ownerType === 'drivers'){
                user = await driverWalletModel.findOne({driver: payment.owner})
            }

            if(!user){
                return next({
                    message: 'farmer appears to not have wallet',
                    statusCode: 404
                })
            }
             user.availableBalance += payment.amount
            await user.save()
        }
       

               res.status(200).json({
                message: 'Payment verified successfully',
                data: payment
               })
        }
        else{
            payment.status = data?.data.status
            //   await payment.save();
            res.status(200).json({
                message: 'payment Verification failed',
                data: payment
            })
        }

    }
    catch(error){
        console.log(error.message)
        return next({
            message: 'something went wrong',
            statusCode: 500
        })

    }
}


const crypto = require('crypto')

exports.handlePaymentWebhook = async(req, res, next) => {
    try {
        console.log(' WEBHOOK RECEIVED') 
        const hash = crypto
            .createHmac('sha256', process.env.koraSecretkey)
            .update(JSON.stringify(req.body.data))
            .digest('hex')

        if(hash !== req.headers['x-korapay-signature']) {
            return res.status(401).json({ message: 'invalid signature' })
        }

        const event = req.body.event
        const data = req.body.data
          console.log('event:', req.body.event)
        console.log('data:', req.body.data)

        if(event === 'charge.success') {
            const reference = data.reference

            const payment = await paymentModel.findOne({ reference })

            if(!payment) {
                return res.status(404).json({ message: 'payment not found' })
            }

            if(payment.status === 'success') {
                return res.status(200).json({ message: 'already processed' })
            }

            payment.status = 'success'
            await payment.save()

            if(!payment.receiver) {
                           let wallet
                           if(payment.ownerType === 'farmers') wallet = await farmWalletModel.findOne({ farmer: payment.owner })
                           else if(payment.ownerType === 'agents') wallet = await agentWalletModel.findOne({ agent: payment.owner })
                           else if(payment.ownerType === 'drivers') wallet = await driverWalletModel.findOne({ driver: payment.owner })
           
                           if(wallet) {
                               wallet.availableBalance += payment.amount
                               await wallet.save()
           
                               // Transaction record — one per user type, no delivery ref for top-ups
                               if(payment.ownerType === 'farmers') {
                                   await farmTransModel.create({
                                       farmer: payment.owner,
                                       wallet: wallet._id,
                                       amount: payment.amount,
                                       type: 'Credit',
                                       description: `Wallet top-up via Korapay (ref: ${payment.reference})`,
                                       status: 'completed'
                                   })
                               } else if(payment.ownerType === 'agents') {
                                   await agentTransModel.create({
                                       agent: payment.owner,
                                       wallet: wallet._id,
                                       amount: payment.amount,
                                       type: 'Credit',
                                       description: `Wallet top-up via Korapay (ref: ${payment.reference})`,
                                       status: 'Successful'
                                   })
                               } else if(payment.ownerType === 'drivers') {
                                   await driveTransModel.create({
                                       driver: payment.owner,
                                       wallet: wallet._id,
                                       amount: payment.amount,
                                       type: 'Credit',
                                       description: `Wallet top-up via Korapay (ref: ${payment.reference})`,
                                       status: 'Successful'
                                   })
                               }
           
                               // Notification — fires only after wallet is credited and transaction saved
                               await notificationModel.create({
                                   owner: payment.owner,
                                   ownerType: payment.ownerType,
                                   title: 'Wallet Funded Successfully',
                                   message: `₦${payment.amount.toLocaleString()} has been added to your wallet. Your new balance is ₦${wallet.availableBalance.toLocaleString()}.`,
                                   type: 'payment'
                               })
                           }
                       }
                   }           

        res.status(200).json({ message: 'webhook received' })

    } catch(error) {
        console.log(error.message)
        res.status(200).json({ message: 'webhook received' })
    }
}





exports.withdrawFunds = async(req, res, next) => {
    try {
        const id  = req.user.id
        const userRole = req.user.role
        const { amount, accountNumber, bankName } = req.body

       
        const bank = nigerianBanks.find(
            b => b.bankName.toLowerCase() === bankName.toLowerCase()
        )

        if (!bank) {
            return next({
                message: 'Invalid bank selected',
                statusCode: 400
            })
        }

        const bankCode = bank.bankCode

        // 1. find user
        let user
        if(userRole === 'farmer') user = await farmerModel.findById(id)
        else if(userRole === 'driver') user = await driverModel.findById(id)
        else if(userRole === 'agent') user = await agentModel.findById(id)

        if(!user) {
            return next({ message: 'user not found', statusCode: 404 })
        }

        // 2. find wallet
        let wallet
        if(userRole === 'farmer') wallet = await farmWalletModel.findOne({ farmer: id })
        else if(userRole === 'driver') wallet = await driverWalletModel.findOne({ driver: id })
        else if(userRole === 'agent') wallet = await agentWalletModel.findOne({ agent: id })

        if(!wallet) {
            return next({ message: 'wallet not found', statusCode: 404 })
        }

        // 3. check balance
        if(wallet.availableBalance < amount) {
            return next({
                message: `Insufficient balance. Available: ₦${wallet.availableBalance.toLocaleString()}`,
                statusCode: 400
            })
        }

        // 4. generate reference
        const ref = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        })
        const reference = `WDR-${ref}`

        // 5. call korapay payout API
        const korapayResponse = await axios.post(
            'https://api.korapay.com/merchant/api/v1/transactions/disburse',
            {
                reference,
                destination: {
                    type: 'bank_account',
                    amount,
                    currency: 'NGN',
                    narration: `FarmGoo withdrawal by ${user.firstName} ${user.lastName}`,
                    bank_account: {
                        bank: bankCode,
                        account: accountNumber
                    },
                    customer: {
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.KORA_API_KEY}`
                }
            }
        )

        const korapayStatus = korapayResponse.data?.data?.status

        // 6. deduct from wallet
        wallet.availableBalance -= amount
        await wallet.save()

        // 7. create transaction record
        const ownerType = userRole === 'farmer' ? 'farmers' : userRole === 'driver' ? 'drivers' : 'agents'

        if(userRole === 'farmer') {
            await farmTransModel.create({
                farmer: id,
                wallet: wallet._id,
                amount,
                type: 'Debit',
                description: `Withdrawal to ${bankName} - ****${accountNumber.slice(-4)}`,
                status: 'Pending Release',
                reference
            })
        } else if(userRole === 'driver') {
            await driveTransModel.create({
                driver: id,
                wallet: wallet._id,
                amount,
                type: 'Debit',
                description: `Withdrawal to ${bankName} - ****${accountNumber.slice(-4)}`,
                status: 'Pending',
                reference
            })
        } else if(userRole === 'agent') {
            await agentTransModel.create({
                agent: id,
                wallet: wallet._id,
                amount,
                type: 'Debit',
                description: `Withdrawal to ${bankName} - ****${accountNumber.slice(-4)}`,
                status: 'Pending Release',
                reference
            })
        }

        // 8. create notification
        await notificationModel.create({
            owner: id,
            ownerType,
            title: 'Withdrawal Initiated',
            message: `Your withdrawal of ₦${amount.toLocaleString()} to ${bankName} ****${accountNumber.slice(-4)} is being processed.`,
            type: 'payment'
        })

        res.status(200).json({
            message: 'Withdrawal initiated successfully',
            data: {
                reference,
                amount,
                bankName,
                accountNumber: `****${accountNumber.slice(-4)}`,
                status: korapayStatus || 'processing',
                newBalance: wallet.availableBalance
            }
        })

    } catch(error) {
    console.log('KORA ERROR:', error.response?.data)

    return next({
        message:
            error.response?.data?.message ||
            error.message ||
            'something went wrong',
        statusCode: 500
    })
    }
}
