const router = require('express').Router();
const auth = require('./auth');
const coin = require('./coin');
const naver = require('./naver');
const favorite = require('./favorite');
const forum = require('./forum');
// const choice = require('./choice');
const authMiddleware = require('../../middlewares/auth');

router.use('/auth', auth);
router.use('/coin', coin);
router.use('/naver', naver);
router.use('/favorite', favorite);
router.use('/forum', forum);


module.exports = router;
