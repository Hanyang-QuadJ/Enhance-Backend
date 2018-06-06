const router = require('express').Router();
const controller = require('./user.controller');
const authMiddleware = require('../../../middlewares/auth');

router.get('/email/check', controller.emailCheck);
router.get('/verify', controller.emailVerification);
router.get('', controller.getUserById);
router.use('', authMiddleware);
router.patch('', controller.updateUsername);
router.use('', authMiddleware);
router.delete("/:id", controller.deleteUser);
router.use('', authMiddleware);
router.patch('/email', controller.changeEmail);
router.use('/profile', authMiddleware);
router.patch('/profile', controller.changeProfileImage);
router.use('/password', authMiddleware);
router.patch('/password', controller.changePassword);
router.post('/test',controller.test);

module.exports = router;
