const vehicleModel = require('../model/vehicleType')

exports.createVehicleType = async(req, res, next) =>{
    try{
        const {vehicleType, baseFare, ratePerKm} = req.body

        const newVehicle = new vehicleModel({
            vehicleType,
            baseFare,
            ratePerKm

        })
        await newVehicle.save()

        res.status(201).json({
            message: 'vehicle type created successfully',
            data: newVehicle
        })

    }
    catch(error){
        return next({
            message: 'something went wrong',
            statusCode: 500
        })
        

    }
}


exports.getAllVehicles = async(req, res, next) =>{
    try{
        const tryToget = await vehicleModel.find()

        res.status(200).json({
            message: 'successfully gotten all vehicles',
            data: tryToget
        })

    }
    catch(error){
        console.log(error.message)
        return next({
            message: 'something went wrong',
            statusCode: 404
        })
    }
}