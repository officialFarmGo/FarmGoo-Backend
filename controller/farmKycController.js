const farmKycModel = require('../model/farmerKyc')
const farmModel = require('../model/farm')
const cropsModel = require('../model/crops')
const jwt = require('jsonwebtoken')


exports.createFarmKyc = async(req, res, next) =>{
    try{
        const {farmId} = req.params

    const { state, specificLocationOrLandmark, whatDoYouFarm, preferredMarketDestination, farmSize } = req.body        
       
        const checkKyc = await farmKycModel.findOne({ farmer: farmId })
        if(checkKyc){
            return next({
                message: 'KYC already exists for this farmer',
            })
        } 

        const farmer = await farmModel.findById(farmId);
        if(!farmer){
            return next({
                message: 'farmer not found',
                statusCode: 404
            })
        }
        console.log('farmer', farmer)

        const foundCrops = await cropsModel.find({ _id: { $in: whatDoYouFarm } })

        if ( !whatDoYouFarm || !Array.isArray(whatDoYouFarm) || whatDoYouFarm.length === 0) {
                return next({
             message: "Please select at least one crop",
                 statusCode: 400
             });
            }
        const createKyc = new farmKycModel({
                farmer: farmId,
               state,
               specificLocationOrLandmark, 
               whatDoYouFarm, 
               preferredMarketDestination,
                farmSize

        })
        await createKyc.save()
        // console.log("farmId:", farmId);
        // farmer.kycVerified = true
        // await farmer.save()

        const newUpdate = await farmModel.findByIdAndUpdate(
            farmId,
            {
                kycVerified: true
        },
        {
            new: true

        }
                )

         const token = jwt.sign(
        { id: farmer._id, role: 'farmer' },
        process.env.JWT_SECRET,
         { expiresIn: '1d' }
        )

        res.status(200).json({
            message: 'kyc for farmer created',
            data: createKyc,
            token
        })

    }
    catch(error){
        console.log(error.message)
        return next({
            message: error.message,
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
            message: error.message,
            statusCode: 500
        })
    }
}