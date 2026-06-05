const farmerModel = require('../model/farm')
const driverModel = require('../model/driver')

const paymentModel = require('../model/payment')

const otpGenerator = require('otp-generator')
const { response } = require('express')
const { default: axios } = require('axios')


exports.initializePayment = async(req, res, next) =>{
    try{
        const farmerId = req.user.id
        const {amount} = req.body

        const farmer = await farmerModel.findById(farmerId)
        if(!farmer){
            return next({
                message: 'something went wrong',
                status
            })
        }

        const ref = otpGenerator.generate(6, {upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false})
        const reference = `FRG-${ref}`

       
       const payment = {
        amount,
        reference,
        currency: 'NGN',
        customer: {
            email: farmer.email,
            name: farmer.name
        },
        redirect_url: 'https://google.com/'
       }

       const response = await axios.post(process.env.kora_initialize, payment, {
        headers: {
            Authorization: `Bearer ${process.env.KORA_API_KEY}`
        }
       })

       const newPayment = new paymentModel({
        owner: farmerId,
        ownerType: 'farmers',
         reference,
        amount: payment.amount
       })

       await newPayment.save()

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

