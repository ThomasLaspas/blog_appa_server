const { number } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    comment: { type: String, require: true },
    from: { type: String, require: true },
    replies: [
      {
        rid: { type: mongoose.Schema.Types.ObjectId },
        userId: { type: Schema.Types.ObjectId, ref: "Users" },
        from: { type: String },
        replyAt: { type: String },
        comment: { type: String },
        time: { type: Number },
        likes: [{ type: String }],
      },
    ],
    likes: [{ type: String }],
    time: { type: Number },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Comments", commentsSchema);
