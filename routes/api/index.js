const router = require('express').Router();
const auth = require('./auth');
const naver = require('./naver');
// const choice = require('./choice');
const authMiddleware = require('../../middlewares/auth');

router.use('/auth', auth);
router.use('/naver', naver);

module.exports = router;
