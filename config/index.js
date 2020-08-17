const config = require('./config.json');
module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || config[process.env.NODE_ENV || 'development'].MONGODB_URI,
  JWTsecret: 'fd8b1c6e9c1203a36326864d9d4e0709',
};
