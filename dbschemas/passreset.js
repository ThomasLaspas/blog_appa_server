const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passreset = new Schema({
  userId: {
    type: String,
  },
  email: { type: String, require: true },
  token: String,
  createdAt: Date,
  expiresAt: Date,
});

module.exports = mongoose.model("ResetPas", passreset);
