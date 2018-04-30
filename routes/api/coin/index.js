const router = require('express').Router();
const controller = require('./coin.controller');
router.get('/all', controller.getAllCoin);
module.exports = router;
