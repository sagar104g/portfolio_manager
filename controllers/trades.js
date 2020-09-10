const HTTPStatus = require('http-status-codes');
const Trade = require('../models/trade');
const log = require('../loggers/appLogger')(__filename);

/**
 *this function helps you initializing your trade
 *your first trade for any stock should go through this 
 */
module.exports.addTrades = async(req, res) => {
  try {
    let {symbol, price, shares, username} = req.body;
    //checking if all values are valid or not
    if(symbol && price > 0 && shares && shares > 0 && shares%1 == 0 && username){
      //check for is this first trade for stock
      let isUserExist = await Trade.findOne({
        $and: [
        { active: true },  
        { username: username }
        ]
      });
      if(!isUserExist){
        // creating trade object
        let addTrade = new Trade({
          symbol,
          price,
          shares,
          action: "BUY",
          username
        })
        //saving trade to the DB
        await addTrade.save();
        res.status(HTTPStatus.OK).send();
      }else{
        res.status(HTTPStatus.NOT_ACCEPTABLE).send();
      }
    }
    res.status(HTTPStatus.UNPROCESSABLE_ENTITY).send();
    
  } catch (err) {
    log.error('Failed to save trade to DB', err);
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send();
  }
};

/**
 * this function helps in putting more trade with BUY and SELL actions
 */
module.exports.updateTrade = async(req, res) => {
  try {
    let {symbol, price, shares, action, username} = req.body;
    action = action ? action.toUpperCase() : action
    //check for validations of feilds
    if(symbol && price > 0 && shares && shares > 0 && shares%1 == 0 && username && ( action=='BUY' || action=='SELL' )){
      //check if same user initialized trade for given symbol
      let isValidUser = await Trade.findOne({
        $and: [
        { active: true },
        { symbol: symbol },
        { username: username }
        ]
      });
      if(isValidUser){
        let safe = true;
        if(action == 'SELL'){
          //check if user is selling more shares then he/she actully have
          await Trade.find({
            $and: [
            { active: true },  
            { symbol: symbol },
            { username: username }
            ]}, function(err, trades ){
              if(trades){
                let shareCount = 0;
                for(trade in trades){
                  if(trades[trade]['action'] == 'BUY'){
                    shareCount += trades[trade]['shares'];
                  }else{
                    shareCount -= trades[trade]['shares'];
                  }
                }
                if( (shareCount - shares) < 0 ){
                  safe = false;
                }
              }
            });
        }
        if(safe){
          //creating trade object
          let addTrade = new Trade({
            symbol,
            price,
            shares,
            action,
            username
          })
          //saving trade in db
          await addTrade.save();
          res.status(HTTPStatus.OK).send();
        }else{
          res.status(HTTPStatus.UNPROCESSABLE_ENTITY).send();
        }
      }else{
        res.status(HTTPStatus.NOT_ACCEPTABLE).send();
      }
      }else{
        res.status(HTTPStatus.UNPROCESSABLE_ENTITY).send();
      }
    res.status(HTTPStatus.UNPROCESSABLE_ENTITY).send();
    
  } catch (err) {
    log.error('Failed to save trade to DB', err);
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send();
  }
};

/**
 * this function used for soft delete of all
 * trade symbol given
 */
module.exports.deleteTrade = async(req, res) => {
  try {
    let {symbol, username} = req.body;
    //check of required feilds
    if(symbol && username){
      //soft deleting all trades with provided symbols
      await Trade.updateMany({
        $and: [
          { symbol: symbol },
          { username: username }
          ]
      }, {
        $set: {active: false}
      });
      res.status(HTTPStatus.OK).send();
    }
    res.status(HTTPStatus.FORBIDDEN).send();
    
  } catch (err) {
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send();
    log.error('Failed to delete trades from DB', err);
  }
};