require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const PORT = 4167
const swaggerUi = require('swagger-ui-express')
const swagger = require('./documentation')
const cors = require('cors')

const router = require('./router/farmRoute')

const driverRouter = require('./router/driverRoute')

const cropRouter = require('./router/cropsRouter')

const farmkycRouter = require('./router/farmKyc')

const vehcRouter = require('./router/vehicleModel')

const agentRouter = require('./router/agentRouter')

const driverKycRouter = require('./router/driverKycRouter')

const paymentRouter = require('./router/paymentRouter')

const deliveryRoute = require('./router/CreateDeliveryRoute')

const bankRouter = require('./router/bankRouter')

const marketRouter = require('./router/marketTips')

const farmerDashBoard = require('./router/farmerDashBoard')




const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/v1/apiDocs', swaggerUi.serve, swaggerUi.setup(swagger))



app.use('/api/v1/farm', router)
app.use('/api/v1/driver', driverRouter)
app.use('/api/v1/crop', cropRouter)

app.use('/api/v1/farmKyc', farmkycRouter)
app.use('/api/v1/agent', agentRouter)


app.use('/api/v1/vehicle', vehcRouter)

app.use('/api/v1/driverKyc', driverKycRouter)

app.use('/api/v1/payment', paymentRouter)

app.use('/api/v1/delivery', deliveryRoute)

app.use('/api/v1/bank', bankRouter)

app.use('/api/v1/marketT', marketRouter)

app.use('/api/v1/farmerDash', farmerDashBoard)


app.use((err, req, res, next)=>{
    const statusCode = err.statusCode || 500;
    const message = err.message ||  'something went wrong';

     res.status(statusCode).json({
        message
    });
})



mongoose.connect(process.env.mongdb_url).then(()=>{console.log('connection is established')
    app.listen(PORT, ()=>{
    console.log(`server is currently running on PORT: ${PORT}`)
})

}).catch((error)=>{
    console.log(`error ${error.message}`)
})


    





