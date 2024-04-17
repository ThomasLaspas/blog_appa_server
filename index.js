const ex = require("express");
const app = ex();
const cors = require("cors");
const body = require("body-parser");
const connectdb = require("./connectdb");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const error = require("./error");
const path = require("path");

//db connection
connectdb();
//mildaware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(ex.urlencoded({ extended: true }));
app.use(ex.json({ limit: "10mb" }));
app.use(morgan("dev"));
// Middleware to set Content Security Policy header
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-inline'");
  next();
});
app.use(ex.static(path.join(__dirname, "./public")));

app.use("/", require("./routes/user"));
app.use("/users", require("./routes/verify"));
app.use("/post", require("./routes/post"));

//mildware for errors
app.use(error);

mongoose.connection.once("open", () => {
  console.log("connected to mongoDb");
  app.listen(3000, console.log("the port we use is 3000"));
});
