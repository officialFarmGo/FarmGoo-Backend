const farmKycModel = require('../model/farmerKyc')
const farmModel = require('../model/farm')
const cropsModel = require('../model/crops')
const {firstLetterChanger} = require('../utils/highFunction')


exports.createFarmKyc = async(req, res, next) =>{
    try{
        const {farmId} = req.params

    const { state, specificLocationOrLandmark, whatDoYouFarm, preferredMarketDestination, farmSize } = req.body        
        // console.log(whatDoYouFarm)
        // const cropNames = req.body.whatDoYouFarm.map((crop)=>firstLetterChanger(crop.cropsName))
        // console.log('cropNames', cropNames)
        // const whatYouFarm = await cropsModel.find({cropsName: {$in:cropNames}}) 
        // console.log('whatYouFarm', whatYouFarm)

        //    if(whatYouFarm.length != cropNames.length){
        //     return next({
        //         message: 'One or more crops are invalid',
        //         statusCode: 404
        //     })
        //    }

        const checkKyc = await farmKycModel.findOne({ farmer: farmId })
        const farmer = await farmModel.findById(farmId);
        console.log("farmer:", farmer);
        if(checkKyc){
            return next({
                message: 'KYC already exists for this farmer',
            })
        } 

        const theCropsName = whatDoYouFarm.split(',').map((crop)=>firstLetterChanger(crop.trim()))

        const foundCrops = await cropsModel.find({cropsName: {$in:theCropsName}})

        if(foundCrops.length !== theCropsName.length){
            return next({
                message: 'one or more crops are invalid',
                statusCode: 404
            })
        }

        const cropIds = await foundCrops.map((crops)=>crops._id)

        const createKyc = new farmKycModel({
                farmer: farmId,
               state,
               specificLocationOrLandmark, 
               whatDoYouFarm: cropIds, 
               preferredMarketDestination,
                farmSize

        })
        await createKyc.save()
        console.log("farmId:", farmId);
        farmer.kycVerified = true
        await farmer.save()

        // const newUpdate = await farmModel.findByIdAndUpdate(
        //     farmId,
        //     {
        //         kycVerified: true
        // },
        // {
        //     new: true

        // }
        //         )

        res.status(200).json({
            message: 'kyc for farmer created',
            data: createKyc
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

exports.GetFarmerKyc = async(req, res, next) =>{
    try{
        const farmId = req.user.id

        const findKyc = await farmKycModel.findOne({ farmer:farmId }).populate('farmer', 'firstName lastName email phoneNumber townOrVillage').populate('whatDoYouFarm', 'cropsName')

        if(!findKyc){
            return next({
                message: 'KYC not found',
                statusCode: 404
            })
            }

            

        res.status(200).json({
            message: 'successfully gotten kyc',
            data: findKyc
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