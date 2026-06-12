const deliveryModel = require("../model/delivery");
const vehicleModel = require("../model/vehicleType");
const farmerWalletModel = require("../model/farmerWallet");
const driverWalletModel = require("../model/driverWallet");
const farmModel = require("../model/farm");
const farmTransModel = require("../model/farmerTrans");
const driveTransModel = require("../model/driverTransactionModel");
const driverModel = require("../model/driver");
const axios = require("axios");
const brevo = require("../utils/brevo");
const brevoBulk = require('../utils/brevoBulk') 
const { newDeliveryRequestTemplate } = require('../utils/bulkTemplate');
const farmWalletModel = require("../model/farmerWallet");
const otpGenerator = require('otp-generator');
const getWeatherAlert = require('../utils/weather')
const marketTipsModel = require('../model/marketTips')
const mongoose = require('mongoose')


exports.driversDashBoardOverview = async(req, res, next) =>{
    try{
        const driverId = req.user.id

        const driver = await deliveryModel.findById(driverId)

        if(!driver){
            return next({
                message: 'driver not found',
                statusCode: 404
            })
        }

        const [] = await Promise.all([
            
        ])

    }
    catch(error){
        return next({
            message: 'something went wrong',
            statusCode: 500
        })
    }
}