const router = require('express').Router();
const controller = require('./daum.controller');

router.get('/search/news', controller.daumNewsSearch);

module.exports = router;
