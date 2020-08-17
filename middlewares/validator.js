const Joi = require('@hapi/joi');
const httpStatus = require('http-status');

exports.validator = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      schema.validate(req[property]);
      next();
    } catch (err) {
      next(err);
    }
  };
};
