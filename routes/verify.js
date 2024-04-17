const ex = require("express");
const app = ex();
const router = ex.Router();
const emailver = require("../controllers/verifyemaeil");
const path = require("path");
const auth = require("../verifyJWT");
const users = require("../controllers/users");

router.get("/verify/:userId/:token", emailver.verifyEmail);
//pass reset
router.post("/request-resetpassword", emailver.resetPass);
router.get("/reset/:userId/:token/:email", emailver.resetpass);
router.post("/resetpassword", emailver.changepass);

//route for user
router.post("/get-user/:id?", auth, users.getuser);
router.put("/update-user", auth, users.updateuser);
router.post("/", auth, users.Getuser);
router.post("/get-anotheruser", auth, users.getacnother);

//friend request
router.post("/friend-request", auth, users.friendrequest);
router.post("/get-friend-request", auth, users.getFriendrq);
router.get("/friends", auth, users.getfriends);

//accept or denie friend request
router.post("/accept-request", auth, users.handlereq);

//view profile
router.post("/profile-view", auth, users.viewprofile);

//sugest friends
router.post("/suggested-firends", auth, users.suggestFriends);

router.get("/verified", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "verify.html"));
});
router.get("/resetpassword", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "resetpass.html"));
});
module.exports = router;
