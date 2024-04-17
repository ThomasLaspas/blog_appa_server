const Users = require("../dbschemas/users");
const bcrypt = require("bcrypt");
const send = require("../sendmail");
const jwt = require("jsonwebtoken");
const friend = require("../dbschemas/friendrequest");
const { date } = require("joi");
require("dotenv").config();

const regist = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(500).json({ message: "all fields is required" });
  //check for duplicates
  const duplicates = await Users.findOne({ username });
  const duplicatemail = await Users.findOne({ email });
  if (duplicates)
    return res
      .status(400)
      .json({ message: "this username is alreay exist try smthing else" });
  if (duplicatemail)
    return res
      .status(400)
      .json({ message: "this email is alreay exist try smthing else" });

  try {
    const cryptedpass = await bcrypt.hash(password, 10);
    const submit = await Users.create({
      username,
      password: cryptedpass,
      email,
    });
    send.senVerificationEmail(submit, res);
    //res.status(200).json({ message: "user creted succefully" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "you must give username and password" });
  const finuser = await Users.findOne({ email });
  if (!finuser)
    return res.status(403).json({ message: "This email not exist" });
  if (!finuser.verified)
    return res
      .status(400)
      .json({ message: "you must verify your email first" });
  const match = await bcrypt.compare(password, finuser.password);
  if (match) {
    const time = Date.now();
    finuser.lastLogin = new Date();
    await finuser.save();
    const accestoken = jwt.sign(
      { _id: finuser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "3600s" }
    );
    finuser.password = undefined;
    res
      .status(200)
      .json({ message: "login succefully", finuser, accestoken, time });
  } else {
    res.status(401).json({ message: "wrong password" });
  }
};

const getuser = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;
    const user = await Users.findById(id ?? userId).populate({
      path: "friends",
      select: "-password",
    });

    if (!user) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }
    user.password = undefined;

    res.status(200).json({
      message: "User found",
      success: true,
      user: user,
    });
  } catch (err) {
    res.status(400).json({
      message: "auth error",
      success: false,
      error: err.message,
    });
  }
};

const getacnother = async (req, res) => {
  const { username } = req.body;
  try {
    if (!username)
      return res.status(404).json({ message: "Give any username" });
    const user = await Users.findOne({ username }).populate({
      path: "friends",
      select: "-password",
    });

    if (!user) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    user.password = undefined;
    res.status(200).json({
      message: "User found",
      success: true,
      user: user,
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
const Getuser = async (req, res) => {
  const { query, userId } = req.body;
  const queryString = String(query);
  try {
    if (!queryString) return res.status(200).json(null);
    const users = await Users.find({
      username: { $regex: `^${queryString}`, $options: "i" },
    });
    if (!users) return res.status(404).json({ message: "No match" });
    const filteredUsers = users.filter(
      (user) => user._id.toString() !== userId
    );
    const usernames = filteredUsers.map((user) => user.username);
    res.status(200).json({ message: "comple", usernames });
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateuser = async (req, res) => {
  try {
    const { username, location, image, profession } = req.body;
    if (!(username || location || image || profession)) {
      return res.status(400).json({ message: "please provide all fileds" });
    }

    const { userId } = req.body;
    const update = {
      username,
      location,
      image,
      profession,
      _id: userId,
    };
    const user = await Users.findByIdAndUpdate(userId, update, {
      new: true,
    });
    await user.populate({ path: "friends", select: "-password" });
    const token = jwt.sign(
      { username: user?.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "3600s" }
    );

    user.password = undefined;
    res.status(200).json({
      success: true,
      message: "user updated succesfully",
      user,
    });
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const friendrequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const { username } = req.body;

    const user = await Users.findOne({ username });

    const reqexist = await friend.findOne({
      requestFrom: userId,
      requestTo: user._id,
    });

    const accexist = await friend.findOne({
      requestFrom: user._id,
      requestTo: userId,
    });

    if (accexist)
      return res.status(300).json({ message: "friend request alllready sent" });

    if (reqexist)
      return res.status(300).json({ message: "friend allreade added" });

    const newres = await friend.create({
      requestTo: user._id,
      requestFrom: userId,
    });
    res.status(200).json({ message: "friend request sent succesfully" });
  } catch (err) {
    res.status(400).json({
      message: "auth error",
      success: false,
      error: err.message,
    });
  }
};

const getFriendrq = async (req, res) => {
  try {
    const { userId } = req.body;

    const request = await friend
      .find({
        requestTo: userId,
        requestStatus: "Pending",
      })
      .populate({
        path: "requestFrom",
        select: "username image profession -password ",
      })
      .limit(10)
      .sort({
        _id: -1,
      });
    console.log(request);
    //  if (!request || request === null)
    // return res.status(404).json({ message: "no request founds" });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (err) {
    res.status(400).json({
      message: "auth error",
      success: false,
      error: err.message,
    });
  }
};

const handlereq = async (req, res) => {
  try {
    const { userId } = req.body;
    const { rid, status } = req.body;
    const requestExist = await friend.findById(rid);

    if (!requestExist)
      return res
        .status(404)
        .json({ messsage: "theres is no friend request to you " });
    const newRes = await friend.findByIdAndUpdate(
      {
        _id: rid,
      },
      {
        requestStatus: status,
      }
    );
    console.log(newRes);

    if (status === "Accepted") {
      const user = await Users.findById(userId);
      user.friends.push(newRes?.requestFrom);
      await user.save();

      const friend = await Users.findById(newRes?.requestFrom);

      friend.friends.push(newRes?.requestTo);

      await friend.save();
    }
    res.status(201).json({
      success: true,
      message: "Friend request" + status,
    });
  } catch (err) {
    res.status(400).json({
      message: "auth error",
      success: false,
      error: err.message,
    });
  }
};

const viewprofile = async (req, res) => {
  try {
    const { userId } = req.body;
    const { username } = req.body;

    const user = await Users.findOne({ username });
    const me = await Users.findById(userId);
    user.views.push(me.username);
    await user.save();

    res.status(200).json({
      success: true,
      message: "successfuly",
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getfriends = async (req, res) => {
  try {
    const { username } = req.body;
    const requests = await friend.find({
      $or: [{ requestTo: username }, { requestFrom: username }],
    });
    if (!requests || requests.length === 0)
      return res
        .status(404)
        .json({ message: "There are no friend requests to or from you." });

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const suggestFriends = async (req, res) => {
  try {
    const { userId } = req.body;
    let queryObject = {};
    queryObject._id = { $ne: userId };
    queryObject.friends = { $nin: userId };
    let queryresult = Users.find(queryObject)
      .limit(15)
      .select("username profileUrl profession -password");
    const suggestFriends = await queryresult;
    res.status(200).json({
      success: true,
      data: suggestFriends,
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
module.exports = {
  login,
  regist,
  getuser,
  updateuser,
  friendrequest,
  getFriendrq,
  handlereq,
  viewprofile,
  suggestFriends,
  Getuser,
  getacnother,
  getfriends,
};
