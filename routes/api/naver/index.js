const router = require('express').Router();
const controller = require('./naver.controller');

router.get('/search/news/:coin_id/:source', controller.naverNewsSearch);

module.exports = router;
