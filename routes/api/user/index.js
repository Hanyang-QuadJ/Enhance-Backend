const router = require('express').Router();
const controller = require('./user.controller');
const authMiddleware = require('../../../middlewares/auth');

router.get('', controller.getUserById);
router.use('', authMiddleware);
router.patch('', controller.updateUsername);
router.use('', authMiddleware);
router.delete("/:id", controller.deleteUser);
module.exports = router;
