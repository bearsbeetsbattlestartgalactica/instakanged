module.exports = async (app, mongooseDb) => {
  const crudRoute = require('../routes/crud.routes')(app);

  await crudRoute.use({
    path: '/api/obj',
    model: require('../../models/obj'),
  });
};
