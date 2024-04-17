const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const emailVerify = new Schema({
  userId: {
    type: String,
  },
  token: { type: String },
  createdAt: { type: Date },
  expiresAT: { type: Date },
});

module.exports = mongoose.model("Verification", emailVerify);
