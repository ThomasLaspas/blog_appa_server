const ex = require("express");
const routes = ex.Router();
const userapi = require("../controllers/users");

routes.route("/login").post(userapi.login);
routes.route("/regist").post(userapi.regist);

module.exports = routes;
