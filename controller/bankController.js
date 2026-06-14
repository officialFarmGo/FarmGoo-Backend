const bankModel = require("../model/bankModel");

const farmModel = require("../model/farm");

const driverModel = require("../model/driver");

const agentModel = require("../model/agent");

const axios = require('axios')

exports.addBank = async (req, res, next) => {
  try {
    const { bankName, AccountName, AccountNumber } = req.body;
    const { id } = req.user;
    const userRole = req.user.role

    const [farmer, driver, agent] = await Promise.all([
      farmModel.findById(id),
      driverModel.findById(id),
      agentModel.findById(id),
    ]);

    const user = farmer ?? driver ?? agent;

    if (!user) {
      return next({
        message: "user not found",
        statusCode: 404,
      });
    };

    const newBank = new bankModel({
        farmerId: user.role === 'farmer' ? user._id : null,
        agentId: user.role === 'agent' ? user._id : null,
        driverId: user.role === 'driver' ? user._id : null,
        bankName,
        AccountName,
        AccountNumber
    })
    await newBank.save()

    res.status(200).json({
        message: 'bank added successfully',
        data: newBank
    })
  } catch (error) {
    console.log(error.message)
    return next({
        message: 'something went wrong',
        statusCode: 500
    })
  }
};


exports.getBankList = async(req, res, next) => {
    try {
      console.log(process.env.koraSecretkey);
        const response = await axios.get(
            'https://api.korapay.com/merchant/api/v1/misc/banks?countryCode=NG',
            {
                headers: {
                    Authorization: `Bearer ${process.env.KORA_API_KEY}`
                }
            }
        )

        res.status(200).json({
            message: 'Banks fetched successfully',
            data: response.data.data
        })

    } catch(error) {
      console.log(error.message)
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}