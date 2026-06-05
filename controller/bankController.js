const bankModel = require("../model/bankModel");

const farmModel = require("../model/farm");

const driverModel = require("../model/driver");

const agentModel = require("../model/agent");

exports.addBank = async (req, res, next) => {
  try {
    const { bankName, AccountName, AccountNumber } = req.body;
    const { id } = req.user;

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
