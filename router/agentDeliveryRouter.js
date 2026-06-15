const router = require("express").Router();

const { agentCreateDelivery , agentCompleteDelivery, agentDeliveryAccept, estimateDeliveryPrice} = require("../controller/AgentdeliveryController");
const { authenticate } = require("../middleWare/auth");
router.post('/createDelivery/:vehhicleId', authenticate, agentCreateDelivery)

router.patch('/acceptDelivery/:deliveryId', authenticate, agentDeliveryAccept)

router.post('/completeDelivery/:deliveryId', authenticate, agentCompleteDelivery)

router.post('/estimatePrice', estimateDeliveryPrice)


module.exports = router;