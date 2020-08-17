var HttpStatus = require('http-status-codes');

// var logger = require('../utils/logger.js');

class CustomError extends Error {
  constructor(
    message = HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR),
    status = HttpStatus.INTERNAL_SERVER_ERROR,
    details = undefined,
    logLevel = 'error'
  ) {
    // Calling parent constructor of base Error class.
    super(message);

    // Capturing stack trace, excluding constructor call from it.
    Error.stackTraceLimit = 20;
    Error.captureStackTrace(this, this.constructor);
    // console.trace('Here I am!');

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;

    this.message = message;
    this.details = details;
    this.status = status;
    this.logLevel = logLevel;
  }

  toResponseJSON() {
    return {
      success: false,
      status: this.status,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}

module.exports.CustomError = CustomError;

module.exports.error = err => {
  const tmperr = new CustomError(err.message, err.status, err.details, err.logLevel);
  console.error(tmperr);
  return tmperr;
};

/**
 * Error response middleware for 404 not found.
 *
 * @param {Object} req
 * @param {Object} res
 */
module.exports.notFound = (req, res, next) => {
  next(
    new CustomError(HttpStatus.getStatusText(HttpStatus.NOT_FOUND), HttpStatus.NOT_FOUND, '', 'warn')
  );
};

/**
 * Generic error response middleware for validation and internal server errors.
 *
 * @param  {Object}   err
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
module.exports.genericErrorHandler = (err, req, res, next) => {
  let tmperr;

  if (err instanceof CustomError) {
    tmperr = err;
  } else {
    // Validation errors
    if (err.name === 'ValidationError' || err.isJoi) {
      tmperr = new CustomError(
        err.message,
        HttpStatus.BAD_REQUEST,
        err.details &&
          err.details.map(err => {
            return {
              message: err.message,
              path: err.path.join('.'),
            };
          })
      );
    } else if (err.name === 'UnauthorizedError') {
      tmperr = new CustomError(err.message || 'Invalid token', 401);
    }
    // HTTP errors
    else if (err.isBoom) {
      tmperr = new CustomError(
        err.output.payload.message || err.output.payload.error,
        err.output.statusCode
      );
    } else {
      tmperr = new CustomError(err.message, err.status, err.details, err.logLevel);
    }
  }
  console.log(tmperr.logLevel, tmperr.message, {
    path: req.originalUrl,
    method: req.method,
    'user-agent': req.headers['user-agent'],
    origin: req.headers.origin,
  });
  console.error(tmperr);
  // return next(err);
  return res.status(tmperr.status).json(tmperr.toResponseJSON());
};
