const User = require("../model/User");

const getUsers = async (req, res) => {
  const users = await User.find();
  if (!users) res.status(204).json({ message: "No users found" });
  res.json(users);
};

module.exports = { getUsers };
