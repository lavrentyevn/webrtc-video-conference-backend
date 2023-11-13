const User = require("../model/User");
const bcrypt = require("bcrypt");

const handleRegister = async (req, res) => {
  const user = await User.findOne({ username: req.body.username }).exec();
  if (user != null) {
    return res.status(409).send("this username already exists");
  }
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
    });

    console.log(user);

    res.status(200).send("register success");
  } catch (e) {
    res.status(500).send("error");
  }
};

module.exports = { handleRegister };
