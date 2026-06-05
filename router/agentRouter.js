const router = require("express").Router();
const { createAgent, loginAgent } = require("../controller/agentController");
router.post("/create-agent", createAgent);
router.post("/login-agent", loginAgent);

module.exports = router;