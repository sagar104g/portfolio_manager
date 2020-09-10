var portfolio = require('./portfolio')
var trade = require('./trades')
var status = require('./status')
const API_PREFIX = '/api/v1';
var authMiddleWare = require('../middleware/auth');

//routes setting up
module.exports = (app) => {
  app.use(API_PREFIX, status);
  app.use(`${API_PREFIX}/portfolio`, authMiddleWare.auth, portfolio);
  app.use(`${API_PREFIX}/trade`, authMiddleWare.auth, trade);
};
