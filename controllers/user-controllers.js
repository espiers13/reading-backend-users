const {
  fetchUserByUsernamePassword,
  createNewUser,
} = require("../models/user-models");

exports.getUserByCredentials = (req, res, next) => {
  const { username, password } = req.body;

  fetchUserByUsernamePassword(username, password)
    .then((usersData) => {
      res.status(200).send(usersData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.postNewUser = (req, res, next) => {
  const newUser = req.body;
  createNewUser(newUser)
    .then((userData) => {
      res.status(201).send(userData);
    })
    .catch((err) => {
      next(err);
    });
};
