const router = require("express").Router();

const { createDelivery } = require("../controller/AgentdeliveryController");
const { authenticate } = require("../middleWare/auth");
router.post('/createDelivery', authenticate, createDelivery)

module.exports = router;