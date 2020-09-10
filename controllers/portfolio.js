const HTTPStatus = require('http-status-codes');
const Trade = require('../models/trade');
const log = require('../loggers/appLogger')(__filename);

/**
 * this function helps in getting all active trades
 * for a user 
 */
var getActiveInvestments = async function (username){
  return new Promise(async function(resolve, reject){
    try{
      //calling db to get all the active trades for user which is sorted by date
      await Trade.find({
        $and: [
        { active: true },
        { username: username }
        ]
      }).sort({createdOn: 1}).exec(function(err, trades){
        let investmentObj = {}
        //creating object for for invesments with active trades
        for(trade in trades){
          if(investmentObj[trades[trade]['symbol']]){
            if(trades[trade]['action'] == 'BUY'){
              investmentObj[trades[trade]['symbol']]['shares'] += trades[trade]['shares']
              investmentObj[trades[trade]['symbol']]['avgShare'] += trades[trade]['shares']
              investmentObj[trades[trade]['symbol']]['avgPrice'] += trades[trade]['price']*trades[trade]['shares']
            }else{
              if(investmentObj[trades[trade]['symbol']]['shares']-trades[trade]['shares'] <= 0){
                delete investmentObj[trades[trade]['symbol']]['shares']
              }else{
                investmentObj[trades[trade]['symbol']]['shares'] -= trades[trade]['shares']
              }
            }
          }else{
            investmentObj[trades[trade]['symbol']] = {
              'shares': trades[trade]['shares'],
              'avgShare':trades[trade]['shares'],
              'avgPrice':trades[trade]['price']*trades[trade]['shares']
            }
          }
        }
        for(let stock in investmentObj){
          investmentObj[stock]['avgPrice'] = (investmentObj[stock]['avgPrice']/investmentObj[stock]['avgShare']);
          delete investmentObj[stock]['avgShare']
        }
        resolve(investmentObj);
      });
    }catch(err){
      reject(err);
    }
  })
}

/**
 * this function helps in getting active holding for user
 */
module.exports.getHoldings = async(req, res) => {
  try {
    let {username} = req.body;
    if(username){
      await getActiveInvestments(username).then((portfolioObj) => {
        res.status(HTTPStatus.OK).json(portfolioObj);
      }).catch(err => {
        log.error(`errot while getting holdings ${err}`);
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send();
      });
    }else{
      res.status(HTTPStatus.NO_CONTENT).send();
    }
  } catch (err) {
    log.error('Failed to get holdings from DB', err);
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send();
  }
};

/**
 * this function helps in getting active portfolio
 * which contain all active trade for user
 */
module.exports.getPortfolio = async(req, res) => {
  try {
    let {username} = req.body;
    if(username){
      await Trade.find({
        $and: [
        { active: true },
        { username: username }
        ]
      }).select({ "username": 1, "action": 1, "shares": 1, "price": 1, "symbol":1, "createdOn":1, "_id": 0}).sort({"createdOn": 1}).exec(function(err, trades){
        let holdingObj = {}
        // creating all active trades object
        for(trade in trades){
          if(holdingObj[trades[trade]['symbol']]){
            holdingObj[trades[trade]['symbol']].push(trades[trade]);
          }else{
            holdingObj[trades[trade]['symbol']] = [trades[trade]];
          }
        }
        res.status(HTTPStatus.OK).json(holdingObj);
      });
    }else{
      res.status(HTTPStatus.NO_CONTENT).send();
    } 
  } catch (err) {
    log.error('Failed to get Portfolio from DB', err);
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send();
  }
};

/**
 * this function helps in getting active returns for user
 */
module.exports.getReturns = async(req, res) => {
  try {
    let {username} = req.body;
    if(username){
      let currentPrice = 100;
      getActiveInvestments(username).then(function(portfolioObj){
        let returns = 0;
        //combining all trades returns
        for(let stock in portfolioObj){
          returns += (currentPrice - portfolioObj[stock]['avgPrice'])*portfolioObj[stock]['shares']
        }
        res.status(HTTPStatus.OK).json({"returns":returns});
      }).catch(err => {
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send();
      });
    }else{
      res.status(HTTPStatus.NO_CONTENT).send();
    }
  } catch (err) {
    log.error('Failed to get holdings from DB', err);
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send();
  }
};
