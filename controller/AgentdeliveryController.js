const agentdeliveryModel = require("../model/agentDelievery");
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

        const agentid = req.agent.id

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