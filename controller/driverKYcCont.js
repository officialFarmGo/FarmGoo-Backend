const driverKycModel = require('../model/driverKyc')
const vehicleModel = require('../model/vehicleType')
const cloudinary = require('../utils/cloudinary')
const fs = require('fs')
const driverModel = require('../model/driver')
const jwt = require('jsonwebtoken')



exports.createKyc = async(req, res, next) =>{
    try{
        const {driverid} = req.params
        const {vehicleType} = req.body

         const driver = await driverModel.findById(driverid);
                if(!driver){
                    return next({
                        message: 'driver not found',
                        statusCode: 404
                    })
                }
                console.log('driverid', driverid)

        const driverLicenseFile = req.files.driversLicense
        const vehiclePhotoFile = req.files.vehiclePhoto
        const vehiclePapersFile = req.files.VehiclePapers

        const driverImage = driverLicenseFile.map((e)=>e.path)
        const vehiclePhotoImage = vehiclePhotoFile.map((e)=>e.path)
        const vehiclePapersImage = vehiclePapersFile.map((e)=>e.path)


        const driverUploadTocloudinary = driverImage.map((e)=>cloudinary.uploader.upload(e)) 
        const vehiclePhotouploadtocloud = vehiclePhotoImage.map((e)=>cloudinary.uploader.upload(e))
        const vehiclePapersUploadtocloud = vehiclePapersImage.map((e)=>cloudinary.uploader.upload(e))


        const cloudinaryDriverResponse = await Promise.all(driverUploadTocloudinary)
        const cloudinaryVehiclePhotoResp = await Promise.all(vehiclePhotouploadtocloud)
        const cloudinaryvehiclePapersResp = await Promise.all(vehiclePapersUploadtocloud)


        const driversExtractedUrl = cloudinaryDriverResponse.map((e)=>e.secure_url)
        const vehiclePhotoExtractedUrl = cloudinaryVehiclePhotoResp.map((e)=>e.secure_url)
        const vehiclePaperExtractUrl = cloudinaryvehiclePapersResp.map((e)=>e.secure_url)

        console.log(' this is the driversExtractedUrl', driversExtractedUrl)
         console.log(' this is the vehiclePhotoExtractedUrl', vehiclePhotoExtractedUrl)
          console.log(' this is the vehiclePaperExtractUrl', vehiclePaperExtractUrl)

 


        const newKyc = new driverKycModel({
    driver: driverid,
    driversLicense: {
        securedUrl: driversExtractedUrl[0],
        publicId: cloudinaryDriverResponse[0].public_id
    },
    vehiclePhoto: {
        securedUrl: vehiclePhotoExtractedUrl[0],
        publicId: cloudinaryVehiclePhotoResp[0].public_id
    },
    VehiclePapers: {
        securedUrl: vehiclePaperExtractUrl[0],
        publicId: cloudinaryvehiclePapersResp[0].public_id
    },
    vehicleType
})

         await Promise.all(
        driverLicenseFile.map((e)=>{
         fs.unlinkSync(e.path)
                        
         })
       )

        await Promise.all(
        vehiclePhotoFile.map((e)=>{
            fs.unlinkSync(e.path)
                        
                    })
                )

        await Promise.all(
        vehiclePapersFile.map((e)=>{
        fs.unlinkSync(e.path)
                        
         })
         )

         await newKyc.save()


         const newUpdate = await driverModel.findByIdAndUpdate(
                     driverid,
                     {
                         kycVerified: true
                 },
                 {
                     new: true
         
                 }
                         )

        const token = jwt.sign(
                    {id: driver._id, role: 'driver'},
                    process.env.JWT_SECRET,
                    {expiresIn: '1d'}
                );
        

        res.status(201).json({
            message: 'successfully created Kyc',
            data: newKyc,
            token
        })

    }
    catch(error){
        console.log(error)
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}