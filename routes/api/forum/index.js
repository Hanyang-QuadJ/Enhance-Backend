const router = require("express").Router();
const controller = require("./forum.controller");
const authMiddleware = require("../../../middlewares/auth");
router.use("/create", authMiddleware);
router.use("/delete", authMiddleware);
router.use("/update", authMiddleware);
router.post("/create", controller.createForum);
router.delete("/:forum_id", controller.deleteForum);
router.post("/update", controller.updateForum);
router.post("/view/:forum_id", controller.forumView);
router.post("/coin", controller.getForumByCoins);
router.get("/user", controller.getForumByUserId);
router.get("/all", controller.getAllForum);
router.post("/filter", controller.getForumByType);
router.get("/one", controller.getOneForum);
router.get("/coin/:forum_id", controller.getForumCoin);

router.post("/create/comment/:forum_id", controller.createComment);
router.get("/comment/:forum_id", controller.getCommentList);
router.get("/comment", controller.getCommentByUserId);
router.use("/hate/:forum_id", authMiddleware);
router.use("/unhate/:forum_id", authMiddleware);
router.use("/hate/check/:forum_id", authMiddleware);
router.post("/hate/:forum_id", controller.forumHate);
router.post("/unhate/:forum_id", controller.forumUnhate);
router.get("/hate/check/:forum_id", controller.forumHateCheck);
router.use("/like/:forum_id", authMiddleware);
router.use("/dislike/:forum_id", authMiddleware);
router.use("/like/check/:forum_id", authMiddleware);
router.post("/like/:forum_id", controller.forumLike);
router.post("/dislike/:forum_id", controller.forumDislike);
router.get("/like/check/:forum_id", controller.forumLikeCheck);
router.delete('/delete/comment', controller.deleteComment);
// router.post('/update/comment/:forum_id', controller.updateComment);

module.exports = router;
