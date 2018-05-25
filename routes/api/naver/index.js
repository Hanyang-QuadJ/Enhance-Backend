const router = require('express').Router();
const controller = require('./naver.controller');

router.get('/search/news', controller.naverNewsSearch);
router.get('/search/blogs', controller.naverBlogSearch);

module.exports = router;
