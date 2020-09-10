const { Router } = require('express');
const router = Router();

const {
  addTrades, updateTrade, deleteTrade
} = require('../controllers/trades');

//routes setup
router.post('/add_trades', addTrades);
router.post('/update_trades', updateTrade);
router.delete('/delete_trades', deleteTrade);

module.exports = router;
