const router = require("express").Router();

const {upload} = require('../middleWare/multer')


const {createAgentKyc} = require("../controller/agentKycCont");


const {createAgentKycValidation} = require('../middleWare/AgentdeliveryValidation')

router.post('/createDelivery/:agentId', upload.fields([{name:'verificationDocument'}]),  createAgentKycValidation, createAgentKyc)


module.exports = router;