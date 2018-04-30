const router = require('express').Router();
const controller = require('./favorite.controller');
const authMiddleware = require('../../../middlewares/auth');
router.use('/add', authMiddleware);
router.post('/add', controller.addFavorite);
module.exports = router;
