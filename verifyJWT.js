const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJWT = (req, res, next) => {
  const aithHeader = req.headers.authorization || req.headers.Authorization;
  if (!aithHeader?.startsWith("Bearer")) return res.sendStatus(401);
  const token = aithHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json(err.message);
    req.body.userId = decoded._id;

    next();
  });
};

module.exports = verifyJWT;
