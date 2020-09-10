const express = require('express');
const app = express();
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
var config = require('./config/config.js');
var initRoutes = require('./routes');
const log = require('./loggers/appLogger')(__filename);

app.use(bodyParser.json())

//mongoDB connection Setup
mongoose.connect(config.DB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 20
}).then(() => {
  log.info('MongoDB connected successfully');
  //initialization of routes
  initRoutes(app);
  app.listen(config.PORT, function(err, res){
    if(err){
      log.error(`server startup failed ${err}`)
    }else{
      log.info(`server started on port ${config.PORT}`)
    }
  })
}).catch(err => {
  log.error(`MongoDB connection failed ${err}`)
})