const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports.registerSchema = Joi.object().keys({
  phone: Joi.string().min(10).max(15).required(),
  pin: Joi.string().min(4).max(128).required(),
  name: Joi.string().max(128).required(),
  role: Joi.string().max(128).required().default('customer'),
  membershipPlan: Joi.number().min(1),
  userGroup: Joi.objectId(),
  details: Joi.object().keys({
    dob: Joi.date().required(),
    bankacs: Joi.array().items(Joi.string()),
    additionalDetails: Joi.object(),
  }),
});
