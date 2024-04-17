const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    location: {
      type: String,
    },
    image: {
      type: String,
    },
    profession: {
      type: String,
    },
    friends: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    views: [{ type: String }],
    verified: { type: Boolean, default: false },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
