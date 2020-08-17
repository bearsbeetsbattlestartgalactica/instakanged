// // const passport = require('passport');
// const session = require('express-session');
// const flash = require('connect-flash');

// module.exports = async app => {
// Passport config
// await require('../config/passport')(passport);
// required for passport
// app.use(
//   session({
//     secret: 'somesecreteh', // session secret
//     resave: true,
//     saveUninitialized: true,
//   })
// );
// Passport middleware
// app.use(passport.initialize());
// app.use(passport.session()); // persistent login sessions
// app.use(flash()); // use connect-flash for flash messages stored in session
// };
