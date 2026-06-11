const marketTipsModel = require('../model/marketTips')

exports.createMarketTip = async(req, res, next) => {
    try {
        const { title, description } = req.body

        const tip = await marketTipsModel.create({ title, description })

        res.status(201).json({
            message: 'Market tip created successfully',
            data: tip
        })

    } catch(error) {
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}