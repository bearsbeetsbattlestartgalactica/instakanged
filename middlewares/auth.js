const User = require('../models/User');
const httpStatus = require('http-status');
const CustomError = require('../middlewares/errorHandler').CustomError;
var parsejwt = require('express-jwt');
const config = require('../config');

const auth = (roles = User.roles) => {
  return [
    parsejwt({
      secret: config.JWTsecret,
      algorithms: ['HS256'],
      credentialsRequired: true,
      getToken: function fromHeaderOrQuerystringOrCookie(req) {
        try {
          const tokenString = (
          req.query.token ||
          req.headers['Authorization'] ||
          req.headers['authorization'] ||
          req.cookies.token
        ).split(' ');
        return tokenString[tokenString.length - 1] || null;
        } catch (err) {
          return null;
        }
      },
    }),
    async (req, res, next) => {
      // see if user is authorized to do the action
      // console.log(req.user, roles);
      if (!roles.includes(req.user.role)) {
        return next(new CustomError('Forbidden', httpStatus.FORBIDDEN));
      }
      next();
    },
  ];
};

module.exports = auth;
