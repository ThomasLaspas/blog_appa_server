const Post = require("../dbschemas/post");
const comm = require("../dbschemas/comments");
const Users = require("../dbschemas/users");
const { string } = require("joi");

const createPost = async (req, res) => {
  try {
    const { userId } = req.body;
    const { description, image } = req.body;
    if (!description)
      return res.satus(500).json({ message: "you must give a description" });
    console.log(userId);

    const post = await Post.create({
      userId,
      description,
      image,
      time: Date.now(),
    });

    if (!post)
      return res.status(500).json({ message: "something wrong happend" });
    res.status(200).json({ message: "your post create successfully" });
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const getpost = async (req, res) => {
  try {
    const { userId } = req.body;
    const { search } = req.body;
    const user = await Users.findById(userId);
    const friends = user?.friends.toString().split(",") ?? [];
    friends.push(userId);

    const searchPostQuery = {
      $or: [{ description: { $regex: search, $options: "i" } }],
    };
    const posts = await Post.find(search ? searchPostQuery : {})
      .populate({
        path: "userId",
        select: "username location image -password",
      })
      .sort({ _id: -1 });

    posts.password = undefined;

    const friendsPosts = posts?.filter((post) => {
      return friends.includes(post?.userId?._id.toString());
    });
    const othersPosts = posts?.filter((post) => {
      return !friends.includes(post?.userId?._id.toString());
    });
    let postsRes = null;
    if (friendsPosts?.length > 0) {
      postsRes = search ? friendsPosts : [...friendsPosts, ...othersPosts];
    } else {
      postsRes = posts;
    }

    res.status(200).json(postsRes);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const getsinglepost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(id).populate({
      path: "userId",
      select: "username location profileUrl -password",
    });
    post.password = undefined;
    if (!post)
      return res.status(404).json({ message: "this post do not exists" });

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const usersPosts = async (req, res) => {
  try {
    const { id } = req.params;
    //const { userId } = req.body;
    //console.log(userId);

    const post = await Post.find({ userId: id })
      .populate({
        path: "userId",
        select: "username location image -password",
      })
      .sort({ _id: -1 });

    // Check if any posts were found
    if (!post || post.length === 0) {
      return res
        .status(404)
        .json({ message: "No posts found for the specified user" });
    }

    // Remove password field from each post
    post.forEach((posts) => (posts.password = undefined));

    res.status(200).json({
      message: "successful",
      data: post,
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const postComme = await comm
      .find({ postId })
      .populate({
        path: "userId",
        select: "username location image -password",
      })
      .populate({
        path: "replies.userId",
        select: "username location image -password",
      })
      .sort({ _id: -1 });
    postComme.password = undefined;

    res.status(200).json({
      message: "success",
      data: postComme,
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getlike = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const index = post.likes.findIndex((pid) => pid === userId.toString());
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter((pid) => pid !== userId.toString());
    }
    const addlike = await Post.findByIdAndUpdate(id, post, { new: true });
    res.status(200).json({ message: "succesfully", data: addlike });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const commentLike = async (req, res) => {
  try {
    const { id, rid } = req.params;
    const { userId } = req.body;
    if (rid === null || rid === undefined || rid === "false") {
      const comment = await comm.findById(id);
      const comindex = comment.likes.findIndex(
        (el) => el === userId.toString()
      );
      if (comindex === -1) {
        comment.likes.push(userId);
      } else {
        comment.likes = comment.likes.filter(
          (pid) => pid !== userId.toString()
        );
      }
      const addpostlike = await comm.findByIdAndUpdate(id, comment, {
        new: true,
      });
      res.status(200).json({ message: "succesfully", data: addpostlike });
    } else {
      const replyComm = await comm.findOne(
        {
          _id: id,
        },
        {
          replies: {
            $elemMatch: {
              _id: rid,
            },
          },
        }
      );
      const index = replyComm?.replies[0]?.likes.filter(
        (i) => i !== String(userId)
      );
      if (index === -1) {
        replyComm.replies[0].likes.push(userId);
      } else {
        replyComm.replies[0].likes = replyComm.replies[0]?.likes.filter(
          (pid) => pid !== string(userId)
        );
      }
      const query = { _id: id, "replies._id": rid };
      const updated = {
        $set: {
          "replies.$.likes": replyComm.replies[0].likes,
        },
      };
      const result = await comm.updateOne(query, updated, { new: true });
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const createcomment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const { comment } = req.body;
    const user = await Users.findById(userId);
    if (!comment)
      return res
        .status(500)
        .json({ message: "You must write something as a comment." });
    const com = await comm.create({
      userId,
      postId: id,
      comment,
      from: user.username,
      time: Date.now(),
    });
    await com.save();
    const post = await Post.findById(id);
    post.Comments.push(com._id);
    const updatepost = await Post.findByIdAndUpdate(id, post, {
      new: true,
    });
    res.status(200).json({ message: "success", data: com, image: user.image });
  } catch (err) {
    res.satus(500).json(err.message);
  }
};

const commentAcomm = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const { comment } = req.body;
    const user = await Users.findById(userId);
    if (!comment)
      return res
        .status(500)
        .json({ message: "You must write something as a comment." });
    const getcom = await comm.findById(id);
    getcom.replies.push({
      comment,
      from: user.username,
      time: Date.now(),
      userId,
      replyAt: getcom.userId,
    });
    getcom.save();
    res.status(200).json({ message: "success", data: getcom });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const deletepost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .satus(500)
        .json({ message: "something wrong happend try again later" });

    const del = await Post.deleteOne({ _id: id }); // Corrected query object
    if (!del || del.deletedCount === 0)
      // Check if deleteOne was successful
      return res
        .status(500)
        .json({ message: "some error occurred, try again later" });

    res.status(200).json({ message: "your post deleted succesfully" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

module.exports = {
  createPost,
  getpost,
  getsinglepost,
  usersPosts,
  getComment,
  getlike,
  commentLike,
  commentAcomm,
  createcomment,
  deletepost,
};
