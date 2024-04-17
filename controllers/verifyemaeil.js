const bcrypt = require("bcrypt");
const email = require("../dbschemas/emailverify");
const Users = require("../dbschemas/users");
const reset = require("../dbschemas/passreset");
const send = require("../sendmail");

const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;
  try {
    const result = await email.findOne({ userId });

    if (result) {
      if (result.expiresAT < Date.now()) {
        email
          .findOneAndDelete({ userId })
          .then(() => {
            Users.findOneAndDelete({ _id: userId })
              .then(() => {
                const message = "verification token has expired";
                res.redirect(`/users/verified?status=error&message=${message}`);
              })
              .catch((err) => {
                res.redirect(
                  `/users/verified?status=error&message=${err.message}`
                );
              });
          })
          .catch((error) => {
            res
              .redirect(`/users/verified?status=error&message=${error.message}`)
              .json(error.message);
          });
      } else {
        bcrypt
          .compare(token, result.token)
          .then((isMatch) => {
            if (isMatch) {
              Users.findByIdAndUpdate({ _id: userId }, { verified: true })
                .then(() => {
                  email.findOneAndDelete({ userId }).then(() => {
                    const message = "email verifified succesfully";
                    res.redirect(
                      `/users/verified?status=success&message=${message}`
                    );
                  });
                })
                .catch((err) => {
                  const message = "verification failed or link is invalid";
                  res.redirect(
                    `users/verified?status=error&message=${message}`
                  );
                });
            } else {
              const message = "verification failed or link is invalid";
              res.redirect(`users/verified?status=error&message=${message}`);
            }
          })
          .catch((err) => {
            res.redirect(`/users/verified?status=error&message=${err.message}`);
          });
      }
    } else {
      const message = "invalid verification link. Try again later.";
      res.redirect(`/users/verified?status=error&message=${message}`);
    }
  } catch (err) {
    res.redirect(`/users/verified?status=error&message=${err.message}`);
  }
};

const resetPass = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "this email is no exist" });
    }

    const existusser = await reset.findOne({ email });
    if (existusser) {
      if (existusser.expiresAt > Date.now()) {
        return res
          .status(500)
          .json({ message: "Reset password already send to your email" });
      }
      await reset.deleteOne({ email });
    }
    await send.resetpassword(user, res);
  } catch (err) {
    res.status(404).json(err.message);
  }
};

const resetpass = async (req, res) => {
  const { userId, token, email } = req.params;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      const message = "try again later. Invalid passwrod reset link";
      res.redirect(`/users/resetpassword?status=error&message=${message}`);
    }

    const resetpass = await reset.findOne({ userId: userId });
    if (resetpass) {
      console.log(resetpass);
      if (resetpass.expiresAt < Date.now()) {
        const message = " link has been expired";
        res.redirect(`/users/resetpassword?status=error&message=${message}`);
      } else {
        const isMatch = await bcrypt.compare(token, resetpass.token);
        if (!isMatch) {
          const message = " Invalid reset password. Please try again";
          res.redirect(`/users/resetpassword?status=error&message=${message}`);
        } else {
          res.redirect(
            `/users/resetpassword?id=${userId}&status=success&email=${email}`
          );
        }
      }
    } else {
      const message = " try again later. Invalid passwrod reset link";
      res.redirect(`/users/resetpassword?status=error&message=${message}`);
    }
  } catch (err) {
    res.status(404).json(err.message);
  }
};

const changepass = async (req, res) => {
  try {
    const { password, conf, email, userId } = req.body;

    if (password !== conf) {
      res
        .status(400)
        .json({ message: "your password did not match with confirm password" });
    } else {
      const user1 = await Users.findOne({ email });

      const hashedpass = await bcrypt.hash(password, 10);
      const user = await Users.findByIdAndUpdate(
        user1._id,

        { password: hashedpass }
      );
      if (user) {
        await reset.findOneAndDelete({ userId });

        const message = "your password succesfully reset.";
        res
          .status(200)
          .redirect(`/users/resetpassword?status=success&message=${message}`);
      }
    }
  } catch (err) {
    res.status(403).json(err.message);
  }
};

module.exports = { verifyEmail, resetPass, resetpass, changepass };
