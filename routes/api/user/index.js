const router = require('express').Router();
const controller = require('./user.controller');
const authMiddleware = require('../../../middlewares/auth');

router.get('', controller.getUserById);
router.use('', authMiddleware);
router.patch('', controller.updateUsername);
router.use('', authMiddleware);
router.delete("/:id", controller.deleteUser);
router.use('', authMiddleware);
router.patch('/email', controller.changeEmail);

router.use('/profile', authMiddleware);
router.put('/profile', controller.changeProfileImage);

router.use('/password', authMiddleware);
router.put('/password', controller.changePassword);

module.exports = router;
