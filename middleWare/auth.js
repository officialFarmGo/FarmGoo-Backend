const jwt = require('jsonwebtoken')


exports.authenticate = (req, res, next) => {
    try{
        const token = req.headers.authorization?.split(" ")[1]
        if(!token){
            return next({
                message: 'invalid token',
                statusCode: 401
            })
        }
        const validToken = jwt.verify(token, process.env.JWT_SECRET, (err, data)=>{
            if(err){
                console.log(err.message)
                return next({
                    message: 'token invalid',
                    statusCode: 401
                })
            }
            req.user = data
            next()
        })

    }
    catch(error){
         next({
            message: 'something went wrong',
            statusCode: 500
         })
        

    }

}