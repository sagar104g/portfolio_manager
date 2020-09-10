const HTTPStatus = require('http-status-codes');

module.exports.getStatus = async (req, res) => {
  res.status(HTTPStatus.OK).json({"status":"alive"});
};
