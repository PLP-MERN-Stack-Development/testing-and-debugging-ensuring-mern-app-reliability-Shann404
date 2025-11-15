// server/controllers/userController.js

exports.createUser = (req, res) => {
  res.status(201).json({ message: 'User created (test placeholder)' });
};

exports.getUsers = (req, res) => {
  res.status(200).json({ users: [] });
};
