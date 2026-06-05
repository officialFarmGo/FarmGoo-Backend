const cropsModel = require('../model/crops')
const {firstLetterChanger} = require('../utils/highFunction')

exports.createCrops = async(req, res, next) =>{
    try{
        const {cropsName} = req.body
        const Name = firstLetterChanger(cropsName)
        const crop = await cropsModel.findOne({cropsName: Name})
        if(crop){
            return next({
                message: 'crop already exist'
            })
        }
        const create = new cropsModel({
            cropsName: Name
        })

        

        await create.save()

        res.status(201).json({
            message: 'crops created successfully',
            data: create
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

exports.getCrops = async(req, res, next) =>{
    try{

        const findCrops = await cropsModel.find()

        res.status(201).json({
            message: 'gotten all crops',
            data: findCrops
        })

    }
    catch(error){
        return next({
            message: 'something went wrong',
            statusCode: 500
        })

    }
}