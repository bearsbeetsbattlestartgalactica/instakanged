const express = require('express');
const app = express();
var path = require('path');

global.appRoot = path.resolve(__dirname);

const loaders = require('./loaders');
loaders(app);
