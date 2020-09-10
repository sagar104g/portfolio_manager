const { Router } = require('express');
const router = Router();

const {
  getPortfolio, getHoldings, getReturns
} = require('../controllers/portfolio');
//routes setup
router.get('/get_portfolio', getPortfolio);
router.get('/get_holdings', getHoldings);
router.get('/get_returns', getReturns);

module.exports = router;
