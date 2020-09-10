const winston = require('winston');

require('winston-daily-rotate-file');

const { format } = winston;
const { printf } = format;

const customLogFormat = printf(
  ({ level, message, timestamp }) => `${timestamp} : ${level.toUpperCase()} : ${message}`
);

const fileTransport = new winston.transports.DailyRotateFile({
  filename: './logs/app-%DATE%.log',
  datePattern: 'DD-MM-YYYY',
  zippedArchive: true,
  maxFiles: '5d'
});

process.on('unhandledRejection', function(reason, p){
  console.log(reason);
});

function CustomError() {
  // Use V8's feature to get a structured stack trace
  const oldStackTrace = Error.prepareStackTrace;
  const oldLimit = Error.stackTraceLimit;
  try {
    Error.stackTraceLimit = 3; // <- we only need the top 3
    Error.prepareStackTrace = function(err, structuredStackTrace){ 
      return structuredStackTrace;
    };
    Error.captureStackTrace(this, CustomError);
    this.stack; // <- invoke the getter for 'stack'
  } finally {
    Error.stackTraceLimit = oldLimit;
    Error.prepareStackTrace = oldStackTrace;
  }
}

function getFileInfo() {
  const stack = new CustomError().stack;
  const CALLER_INDEX = 2; // <- position in stacktrace to find deepest caller
  const element = stack[CALLER_INDEX];
  return element.getFileName()+':'+element.getLineNumber()+':'+element.getColumnNumber();
}

const logger = winston.createLogger({
  format: winston.format.combine(format.timestamp(), customLogFormat),
  transports: [
    new winston.transports.Console(),
    fileTransport
  ]
});

module.exports = (fullFilename) => {
  const info = (msg, data = '') => {
    logger.info(`${getFileInfo()} : ${msg} ${data}`);
  };

  const error = (msg, data = '') => {
    logger.error(`${getFileInfo()} : ${msg} ${data}`);
  };

  const warn = (msg, data = '') => {
    logger.warn(`${getFileInfo()} : ${msg} ${data}`);
  };

  return {
    info,
    error,
    warn
  };
};
