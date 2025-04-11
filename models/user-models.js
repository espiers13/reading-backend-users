const db = require("../db/index");
const bcrypt = require("bcrypt");

const saltRounds = 10;

exports.fetchUserByUsernamePassword = (username, password) => {
  return db
    .query(
      `SELECT username, name, password, email, id, avatar FROM users WHERE username = $1;`,
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

exports.fetchUserById = (user_id) => {
  return db
    .query("SELECT username, avatar FROM users WHERE id = $1", [user_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "User not found",
        });
      } else return rows[0];
    });
};

exports.fetchIdByUsername = (username) => {
  return db
    .query("SELECT id, username FROM users WHERE username = $1", [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "User not found",
        });
      } else return rows[0];
    });
};

exports.removeUserData = (userData) => {
  return db
    .query(`DELETE FROM users WHERE id = $1 RETURNING *;`, [userData.id])
    .then(({ rows }) => {
      return rows;
    });
};

exports.updateUserData = (userData, newData) => {
  const { id } = userData;

  const dataKey = Object.keys(newData)[0];
  const data = Object.values(newData)[0];

  const queryStr = `UPDATE users SET ${dataKey} = $1 WHERE id = $2 RETURNING name, username, email, avatar, id;`;

  return db.query(queryStr, [data, id]).then(({ rows }) => {
    return rows[0];
  });
};

exports.fetchJournalById = (id) => {
  return db
    .query("SELECT * FROM booksjournal WHERE user_id = $1", [id])
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchBookshelfById = (id) => {
  return db
    .query("SELECT * FROM bookshelf WHERE user_id = $1", [id])
    .then(({ rows }) => {
      return rows;
    });
};

exports.postToBookshelf = (id, newBook) => {
  const { isbn, title } = newBook;

  return db
    .query(
      `INSERT INTO bookshelf (user_id, isbn, title) VALUES ($1, $2, $3) RETURNING *`,
      [id, isbn, title]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.removeFromBookshelf = (isbn, id) => {
  return db
    .query(
      `DELETE FROM bookshelf WHERE user_id = $1 AND isbn = $2 RETURNING *;`,
      [id, isbn]
    )
    .then((data) => {
      return data;
    });
};

exports.postToJournal = (id, newBook) => {
  const { isbn, title, rating = null, review = null } = newBook;

  return db
    .query(
      `INSERT INTO booksjournal (user_id, isbn, title, rating, review) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *;`,
      [id, isbn, title, rating, review]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.removeFromJournal = (isbn, id) => {
  return db
    .query(
      `DELETE FROM booksjournal WHERE user_id = $1 AND isbn = $2 RETURNING *;`,
      [id, isbn]
    )
    .then((data) => {
      return data;
    });
};

exports.moveBookToJournal = (isbn, user_id, rating, review) => {
  return db
    .query(
      `WITH moved_book AS (
         DELETE FROM bookshelf
         WHERE user_id = $1 AND isbn = $2
         RETURNING user_id, title, isbn
       )
       INSERT INTO booksjournal (isbn, user_id, title, date_read, rating, review)
       SELECT isbn, user_id, title, CURRENT_DATE, $3, $4
       FROM moved_book
       RETURNING *;`,
      [user_id, isbn, rating, review]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Book not found",
        });
      } else return rows[0];
    });
};

exports.sendFriendRequest = (userId, friendId) => {
  return db.query(
    `INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, 'pending') ON CONFLICT DO NOTHING RETURNING *;`,
    [userId, friendId]
  );
};

exports.addFriend = (userId, friendId) => {
  return db
    .query(
      `UPDATE friendships SET status = 'accepted' WHERE user_id = $1 AND friend_id = $2 RETURNING *;`,
      [userId, friendId]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.fetchFriendsList = (userId) => {
  return db
    .query(
      `
      SELECT u.id, u.username, u.avatar, f.status 
      FROM users u
      JOIN friendships f ON (u.id = f.friend_id OR u.id = f.user_id)
      WHERE (f.user_id = $1 OR f.friend_id = $1)
      AND f.status = 'accepted'
      AND u.id != $1`,
      [userId]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchPendingList = (userId) => {
  return db
    .query(
      `
      SELECT u.id, u.username, u.avatar, f.status 
      FROM users u
      JOIN friendships f ON (u.id = f.friend_id OR u.id = f.user_id)
      WHERE (f.user_id = $1 OR f.friend_id = $1)
      AND f.status = 'pending'
      AND u.id != $1`,
      [userId]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchFavouritesByUserId = (userId) => {
  return db
    .query(`SELECT id FROM users WHERE id = $1;`, [userId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User not found" });
      } else
        return db
          .query(`SELECT isbn FROM favourites WHERE user_id = $1;`, [userId])
          .then(({ rows }) => {
            return rows;
          });
    });
};

exports.postFavouriteById = (userId, newBook) => {
  const { isbn } = newBook;

  return db
    .query(`SELECT COUNT(*) FROM favourites WHERE user_id = $1;`, [userId])
    .then(({ rows }) => {
      if (rows[0].count === "3") {
        return Promise.reject({
          status: 400,
          msg: "User can only have 3 favorite books",
        });
      } else
        return db
          .query(
            `INSERT INTO favourites (user_id, isbn) VALUES ($1, $2) RETURNING *;`,
            [userId, isbn]
          )
          .then(({ rows }) => {
            return rows[0];
          });
    });
};

exports.removeFromFavourites = (userId, isbn) => {
  return db
    .query(
      "DELETE FROM favourites WHERE user_id = $1 AND isbn = $2 RETURNING *;",
      [userId, isbn]
    )
    .then((deletedBook) => {
      return deletedBook;
    });
};
