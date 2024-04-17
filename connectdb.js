const mongoose = require("mongoose");
require("dotenv").config();

const conectdb = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      useUnifiedTopology: true,
      useNewurlParser: true,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = conectdb;
