const farmerModel = require('../model/farm')
const driverModel = require('../model/driver')

const paymentModel = require('../model/payment')

const otpGenerator = require('otp-generator')
const { response } = require('express')
const { default: axios } = require('axios')


exports.initializePayment = async(req, res, next) =>{
    try{
        const {id} = req.user
        const userRole  = req.user.role
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

        const ref = otpGenerator.generate(6, {upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false})
        const reference = `FRG-${ref}`

       
       const payment = {
        amount,
        reference,
        currency: 'NGN',
        customer: {
            email: user.email,
            name:`${user.firstName} ${user.lastName}`
        },
        redirect_url: 'https://google.com/'
       }

       const response = await axios.post(process.env.kora_initialize, payment, {
        headers: {
            Authorization: `Bearer ${process.env.KORA_API_KEY}`
        }
       })

       const newPayment = new paymentModel({
        owner: id,
        ownerType,
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

