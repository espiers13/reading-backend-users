const bcrypt = require("bcrypt");

const saltRounds = 10;

/**
 * Hashes passwords for an array of users.
 * @param {Array} usersData - Array of user objects with name, username, email, and password.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of users with hashed passwords.
 */
const hashUsersData = async (usersData) => {
  return Promise.all(
    usersData.map(async ({ name, username, email, password }) => {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return [name, username, email, hashedPassword];
    })
  );
};

module.exports = hashUsersData;
