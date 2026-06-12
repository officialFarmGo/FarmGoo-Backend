const farmerModel = require('../model/farm')
const driverModel = require('../model/driver')

const paymentModel = require('../model/payment')

const otpGenerator = require('otp-generator')
const { response } = require('express')
const { default: axios } = require('axios')
const farmModel = require('../model/farm')
const agentModel = require('../model/agent')
const farmWalletModel = require('../model/farmerWallet')
const agentWalletModel = require('../model/agentWallet')
const driverWalletModel = require('../model/driverWallet')


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
        redirect_url: 'https://google.com/'
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
        data: response.data?.data
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
        // 1. Verify the request is actually from Korapay
        const hash = crypto
            .createHmac('sha256', process.env.KORA_SECRET_KEY)
            .update(JSON.stringify(req.body.data))
            .digest('hex')

        if(hash !== req.headers['x-korapay-signature']) {
            return res.status(401).json({ message: 'invalid signature' })
        }

        const event = req.body.event
        const data = req.body.data

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
                let user

                if(payment.ownerType === 'farmers') {
                    user = await farmWalletModel.findOne({ farmer: payment.owner })
                } else if(payment.ownerType === 'agents') {
                    user = await agentWalletModel.findOne({ agent: payment.owner })
                } else if(payment.ownerType === 'drivers') {
                    user = await driverWalletModel.findOne({ driver: payment.owner })
                }

                if(user) {
                    user.availableBalance += payment.amount
                    await user.save()
                }
            }
        }

        res.status(200).json({ message: 'webhook received' })

    } catch(error) {
        console.log(error.message)
        res.status(200).json({ message: 'webhook received' })
    }
}



