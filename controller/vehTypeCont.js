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