const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const fs = require('fs');

module.exports = async () => {
  // DB Config
  const dbUrl = process.env.MONGODB_URI || require('../config').mongoURI;

  // Connect to MongoDB
  const connection = await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  const modelDir = __dirname + '/../models';
  fs.readdirSync(modelDir).forEach(function (file) {
    if (~file.indexOf('.js')) require(modelDir + '/' + file);
  });

  // returns promise
  return connection.connection.db;
};
