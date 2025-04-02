const db = require("../index.js");
const format = require("pg-format");
const hashUsersData = require("./utils.js"); // Import the utility function

const seed = async ({ usersData }) => {
  try {
    // Drop existing table if it exists
    await db.query(`DROP TABLE IF EXISTS users;`);

    // Create the users table
    await db.query(`
      CREATE TABLE users (   
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    // Hash passwords using the utility function
    const hashedUsersData = await hashUsersData(usersData);

    // Insert users with hashed passwords
    const insertUsersString = format(
      "INSERT INTO users (name, username, email, password) VALUES %L RETURNING *;",
      hashedUsersData
    );

    return db.query(insertUsersString);
  } catch (err) {
    console.error("Error seeding the database:", err);
  }
};

module.exports = seed;
