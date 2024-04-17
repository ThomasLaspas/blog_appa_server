const { v4: uuid } = require("uuid");
const { format } = require("date-fns");
const logEvents = async (message, logName) => {
  const datetime = `${format(new Date(), "dd|MM|yyyy\tHH:mm:ss")}`;
  const logItem = `${datetime}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "logs"))) {
      await fsp.mkdir(path.join(__dirname, "logs"));
    }
    await fsp.appendFile(path.join(__dirname, "logs", logName), logItem);
  } catch (err) {
    console.log(err);
  }
};
const loger = (req, res, next) => {
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, "reqlog.txt");
  console.log(`${req.method}${req.path}`);
  next();
};

module.exports = { logEvents, loger };
