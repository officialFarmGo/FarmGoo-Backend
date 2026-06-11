const Joi = require("joi");

const validateAgentDelivery = (req, res, next) => {
  const schema = Joi.object({
    deliveryId: Joi.string().required(),
    otp: Joi.string().length(6).required(),
    deliveryStatus: Joi.string()
      .valid("Delivered")
      .required(),
    proofOfDelivery: Joi.string().required()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

module.exports = validateAgentDelivery;
        

            