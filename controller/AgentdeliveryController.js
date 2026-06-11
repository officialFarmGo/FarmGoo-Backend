const agentdeliveryModel = require("../model/agentDelivery");
const agentModel = require("../model/agent");

exports.createDelivery = async (req, res, next) => {
    try {
        const { 
             selectFarmer, 
             producetype, 
             qualityCheckDelivery, 
             pickupLocation,  
             destination, 
             customerDetails, 
             pickupDate, 
             vehicleType 
            } = req.body;

        const agentid = req.user.id;
        const delivery = new agentdeliveryModel({
            selectFarmer,
            producetype,
            qualityCheckDelivery,
            pickupLocation,
            destination,
            customerDetails,
            pickupDate,
            vehicleType,
            agentid
        });

        await delivery.save();
        res.status(201).json({
            message: 'Delivery created successfully',
            delivery
        });
    } catch (error) {
        console.error(error);
        next();
    }
}