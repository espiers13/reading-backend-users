const db = require("../db/index");
const bcrypt = require("bcrypt");

const saltRounds = 10;

exports.fetchUserByUsernamePassword = (username, password) => {
  return db
    .query(
      `SELECT id, name, username, email, password FROM users WHERE username = $1;`,
      [username]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 401,
          msg: "User not found",
        });
      }

      const user = rows[0];

      return bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return Promise.reject({
            status: 401,
            msg: "Invalid password",
          });
        }
        delete user.password;
        return user;
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.createNewUser = (newUser) => {
  const { name, username, email, password } = newUser;

  return bcrypt.hash(password, saltRounds).then((hashedPassword) => {
    const queryStr = `INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *;`;
    const values = [name, username, email, hashedPassword];

    return db.query(queryStr, values).then(({ rows }) => {
      return rows[0];
    });
  });
};
