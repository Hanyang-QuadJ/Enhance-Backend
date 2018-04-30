const router = require('express').Router();
const controller = require('./naver.controller');

router.get('/search/news', controller.naverNewsSearch);

module.exports = router;
