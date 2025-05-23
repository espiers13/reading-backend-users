const db = require("../index.js");
const format = require("pg-format");
const hashUsersData = require("./utils.js"); // Import the utility function

const seed = ({
  usersData,
  bookshelfData,
  booksReadData,
  favouritesData,
  currentlyReadingData,
}) => {
  return db
    .query(`DROP TABLE IF EXISTS favourites;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS booksjournal;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS bookshelf;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS friendships;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS currentlyreading`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE users (   
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password TEXT NOT NULL,
          avatar TEXT DEFAULT 'https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg',
          pronouns TEXT DEFAULT NULL
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE bookshelf (   
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          isbn VARCHAR(13) NOT NULL
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE booksjournal (   
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          isbn VARCHAR(13) NOT NULL,
          date_read DATE DEFAULT (CURRENT_DATE),
          review VARCHAR,
          rating DECIMAL(2,1) CHECK (rating IN (1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5))
        );
      `);
    })
    .then(() => {
      return db.query(`
          CREATE TABLE friendships (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL,
            friend_id INT NOT NULL,
            status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (user_id, friend_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
        );`);
    })
    .then(() => {
      return db.query(`
      CREATE TABLE favourites (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        isbn VARCHAR(13) NOT NULL,
        UNIQUE (user_id, isbn)
      );
      `);
    })
    .then(() => {
      return db.query(`
      CREATE TABLE currentlyreading (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        isbn VARCHAR(13) NOT NULL,
        UNIQUE (user_id)
      )`);
    })
    .then(() => {
      return hashUsersData(usersData);
    })
    .then((hashedUsersData) => {
      const insertUsersString = format(
        "INSERT INTO users (name, username, email, password) VALUES %L RETURNING *;",
        hashedUsersData
      );
      return db.query(insertUsersString);
    })
    .then(() => {
      const insertBookshelfString = format(
        "INSERT INTO bookshelf (user_id, isbn) VALUES %L RETURNING *;",
        bookshelfData.map(({ user_id, isbn }) => [user_id, isbn])
      );
      return db.query(insertBookshelfString);
    })
    .then(() => {
      const insertBooksJournalString = format(
        "INSERT INTO booksjournal (user_id, isbn, date_read, review, rating) VALUES %L RETURNING *;",
        booksReadData.map(({ user_id, isbn, date_read, review, rating }) => [
          user_id,
          isbn,
          date_read,
          review,
          rating,
        ])
      );
      return db.query(insertBooksJournalString);
    })
    .then(() => {
      const insertFavouritesString = format(
        "INSERT INTO favourites (user_id, isbn) VALUES %L RETURNING *;",
        favouritesData.map(({ user_id, isbn }) => [user_id, isbn])
      );
      return db.query(insertFavouritesString);
    })
    .then(() => {
      const insertCurrentlyReadingString = format(
        "INSERT INTO currentlyreading (user_id, isbn) VALUES %L RETURNING *;",
        currentlyReadingData.map(({ user_id, isbn }) => [user_id, isbn])
      );
      return db.query(insertCurrentlyReadingString);
    });
};

module.exports = seed;
