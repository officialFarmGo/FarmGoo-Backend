const agentFarmerModel = require('../model/agentFarmer')
const agentModel = require('../model/agent')




exports.createAgentFarmer = async (req, res, next) => {
    try {
        const agentId = req.user.id
        const { farmerFullName, phoneNumber, farmLocation, mainProduceType } = req.body

        const agent = await agentModel.findById(agentId)
        if (!agent) {
            return next({ message: 'agent not found', statusCode: 404 })
        }

        const checkPhone = await agentFarmerModel.findOne({phoneNumber})
                        if(checkPhone){
                            return next({
                                message: "Phone number already exists",
                                 statusCode: 400
                            });
                        }

        const newAgentFarmer = new agentFarmerModel({
            agent: agentId, 
            farmerFullName,
            phoneNumber,
            farmLocation,
            mainProduceType
        })

        await newAgentFarmer.save() 
        res.status(201).json({
            message: 'agents farmer added successfully',
            data: newAgentFarmer
        })

    } catch (error) {
        return next({ message: 'something went wrong', statusCode: 500 })
    }
}