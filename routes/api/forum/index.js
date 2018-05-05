const router = require('express').Router();
const controller = require('./forum.controller');
const authMiddleware = require('../../../middlewares/auth');
router.use('/create', authMiddleware);
router.use('/delete', authMiddleware);
router.use('/update', authMiddleware);
router.post('/create', controller.createForum);
router.post('/delete', controller.deleteForum);
router.post('/update', controller.updateForum);
router.get('/all', controller.getAllForum);
router.get('/one', controller.getOneForum);

router.post('/create/comment/:forum_id', controller.createComment);
// router.post('/delete/comment/:forum_id', controller.deleteComment);
// router.post('/update/comment/:forum_id', controller.updateComment);

module.exports = router;
