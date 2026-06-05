const deliveryModel = require('../model/delivery')

const farmModel = require('../model/farm')

const driverModel = require('../model/driver')

const axios = require('axios')



exports.testDistane = async(req, res, next) =>{
    try{
        const {origin, destination} = req.body

        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/distancematrix/json', 
            { 
                params: {
                destinations: destination,
                origins: origin,
                key: process.env.GOOGLE_MAPS_API_KEY,
                units: 'metric'

                } 
            }
        )

        const data = response.data
        const element = data.rows[0].elements[0]
        const distanceKm = element.distance.value / 1000
        const duration = element.duration.text

        res.status(200).json({
            message: 'Distance calculated',
            duration,
            raw: data

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










exports.createDelivery = async(req, res, next) =>{
    try{
 const {productType, quantity, weight, AddressOrpickUpLocation, landMarkToAddressForPickup,Destination, customersPhoneNumber, CustomersOtherNumber, pickupSchedule, vehicleType} = req.body

    }
    catch(error){

    }
}