const router = require('express').Router();
const auth = require('./auth');
const coin = require('./coin');
const naver = require('./naver');
const admin = require('./admin');
const daum = require('./daum');
const favorite = require('./favorite');
const forum = require('./forum');
const user = require('./user');
// const choice = require('./choice');

router.use('/admin', admin);

router.use('/auth', auth);
router.use('/coin', coin);
router.use('/naver', naver);
router.use('/daum', daum);
router.use('/favorite', favorite);
router.use('/forum', forum);
router.use('/user', user);


module.exports = router;
