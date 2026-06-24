const agentModel = require('../model/agent')
const cropsModel = require('../model/crops')
const jwt = require('jsonwebtoken')
const cloudinary = require('../utils/cloudinary')
const fs = require('fs')
const agentKycModel = require('../model/agentKyc')
const farmKycModel = require('../model/farmerKyc')


exports.createAgentKyc = async(req, res, next) =>{
    try{
        const {agentId} = req.params

    const { state,
         residentialAddress, 
         kinsFirstName,
          kinsLastName,
           kinsPhoneNumber,
           kinsEmail,
           kinsRelationship,
           kinsLgaOrTown,    
        } = req.body        
       
        const checkKyc = await agentKycModel.findOne({ agent: agentId})
        if(checkKyc){
            return next({
                message: 'KYC already exists for this agent',
                statusCode: 404
            })
        } 

        const agent = await agentModel.findById(agentId);
        if(!agent){
            return next({
                message: 'Agent not found',
                statusCode: 404
            })
        }
      const newfile = req.files.verificationDocument
      const newImage = newfile.map((e)=>e.path)

      const uploadtocloudinary = newImage.map((e)=>cloudinary.uploader.upload(e))
      const cloudinaryResponse = await Promise.all(uploadtocloudinary)
      const extractedUrl = cloudinaryResponse.map((e)=>e.secure_url)

      console.log('this is the extracted url', extractedUrl)

        




        const createKyc = new agentKycModel({
            agent: agentId,
            state,
            residentialAddress, 
            kinsFirstName,
            kinsLastName,
           kinsPhoneNumber,
           kinsEmail,
           kinsRelationship,
           kinsLgaOrTown,    
           verificationDocument: {
        securedUrl: extractedUrl[0],
        publicId: cloudinaryResponse[0].public_id
            },  
            })
        await createKyc.save()

        await Promise.all(
                newfile.map((e)=>{
                 fs.unlinkSync(e.path)
                                
                 })
               )
        

        const newUpdate = await agentModel.findByIdAndUpdate(
            agentId,
            {
                kycVerified: true
        },
        {
            new: true

        }
                )

         const token = jwt.sign(
        { id: agent._id, role: 'agent' },
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
