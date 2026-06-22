const sendUsMessageModel = require('../model/sendMessage')



exports.createMessage = async(req, res, next) =>{
    try{

        const {name,phoneNumber, howCanWeHelp} = req.body

        const createMessage = await sendUsMessageModel.create({
            name,
            phoneNumber,
            howCanWeHelp
        })


        res.status(201).json({
            message: 'Thank you for reaching out. We will get back to you shortly.',
            data: createMessage
        })

    }
catch(error){
    return next({
        message: error.message,
        statusCode: 500
    })

}
}
