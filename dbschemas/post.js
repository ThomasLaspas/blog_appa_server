const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    description: { type: String, require: true },
    image: { type: String },
    likes: [{ type: String }],
    Comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
    time: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
