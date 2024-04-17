const ex = require("express");
const router = ex.Router();
const auth = require("../verifyJWT");
const post = require("../controllers/post");

//CREATE POST
router.post("/create", auth, post.createPost);
//Get post
router.post("/", auth, post.getpost);
//get sisngle post
router.post("/:id", auth, post.getsinglepost);
//get users posts
router.post("/userposts/:id", auth, post.usersPosts);
// get comments
router.get("/coment/:postId", post.getComment);
//like a post
router.post("/like/:id", auth, post.getlike);
//like a comment
router.post("/like-comment/:id/:rid?", auth, post.commentLike);
//comment a comment and post
router.post("/commentpost/:id", auth, post.createcomment);
router.post("/comment-comment/:id", auth, post.commentAcomm);
//delete post
router.delete("/:id", auth, post.deletepost);

module.exports = router;
