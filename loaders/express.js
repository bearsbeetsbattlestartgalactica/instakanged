const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const flash = require('connect-flash');
const session = require('express-session');
// const moment = require('moment');

// const path = require('path');

const errorHandler = require('../middlewares/errorHandler.js');

const normalizePort = require('../utils/normalizePort');

module.exports = async (app, mongooseDb) => {
  const PORT = normalizePort(process.env.PORT || 8080);
  await app.set('PORT', PORT);

  await app.use(cors());
  await app.use(helmet());
  await app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
      },
    })
  );

  await app.use(cookieParser()); // read cookies (needed for auth)
  await app.use(
    session({
      secret: 'somesecreteh', // session secret
      resave: true,
      saveUninitialized: true,
    })
  );
  await app.use(flash());

  await app.use(express.urlencoded({ extended: true }));
  await app.use(express.json());

  await app.set('view engine', 'ejs');
  await app.use(express.static('public'));
  await app.use(express.static('assets'));
  await app.use(express.static('uploads'));

  app.use(function (req, res, next) {
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    // res.locals.moment = moment;
    next();
  });

  // Routes
  const routes = require('../api/routes/index');
  await routes(app, mongooseDb);

  // express.response.render hook :P
  const _render = express.response.render;
  express.response.render = function (view, options, callback) {
    /** here this refer to the current res instance and you can even access req for this res: **/
    try {
      options = { ...options, ...(this.req.user && { currentUser: this.req.user }) };
      _render.apply(this, [view, options, callback]);
    } catch (err) {
      errorHandler.error(err);
    }
  };

  app.get('/ping', (req, res) => {
    res.send('hi!!');
  });

  // app.get('/cleardb', (req, res) => {
  //   try {
  //     mongooseDb.dropDatabase(console.log(`${mongooseDb.databaseName} database dropped.`));
  //     res.send('Ok');
  //   } catch (err) {
  //     res.send(err);
  //   }
  // });

  // Error Middleware
  app.use(errorHandler.notFound);
  app.use(errorHandler.genericErrorHandler);

  // Create HTTP server.
  var server = http.createServer(app);

  // // Listen on provided port, on all network interfaces.
  server.listen(PORT);
  server.on('error', onError);
  console.log(`✌️ Server started on port ${PORT}\t`);
  console.log();

  // // Catch unhandled rejections
  process.on('unhandledRejection', err => {
    console.error('Unhandled rejection', err);
    //   // logger.error('Unhandled rejection', err);
    process.exit(1);
  });

  // // Catch uncaught exceptions
  process.on('uncaughtException', err => {
    console.error('Uncaught exception', err);
    process.exit(1);
  });

  // // Event listener for HTTP server "error" event.
  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

    // // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
};
