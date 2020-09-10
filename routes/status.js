const { Router } = require('express');
const router = Router();
const {
  getStatus
} = require('../controllers/status');

router.get('/status', getStatus);

module.exports = router;
