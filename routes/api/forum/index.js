const router = require('express').Router();
const controller = require('./forum.controller');
const authMiddleware = require('../../../middlewares/auth');
router.use('/create', authMiddleware);
router.use('/delete', authMiddleware);
router.use('/update', authMiddleware);
router.post('/create', controller.createForum);
router.post('/delete', controller.deleteForum);
router.post('/update', controller.updateForum);
router.post('/coin', controller.getForumByCoins);
router.get('/user', controller.getForumByUserId);
router.get('/all', controller.getAllForum);
router.get('/one', controller.getOneForum);
router.get('/coin/:forum_id', controller.getForumCoin);

router.post('/create/comment/:forum_id', controller.createComment);
router.get('/comment/:forum_id', controller.getCommentList);
router.get('/comment', controller.getCommentByUserId);

// router.post('/delete/comment/:forum_id', controller.deleteComment);
// router.post('/update/comment/:forum_id', controller.updateComment);

module.exports = router;
