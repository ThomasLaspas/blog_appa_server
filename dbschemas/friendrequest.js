const mongoose = require("mongoose");
const { stringify } = require("uuid");
const users = require("./users");
const Schema = mongoose.Schema;

const friendReq = new Schema(
  {
    requestTo: { type: Schema.Types.ObjectId, ref: "Users" },
    requestFrom: { type: Schema.Types.ObjectId, ref: "Users" },
    requestStatus: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("friendReq", friendReq);
