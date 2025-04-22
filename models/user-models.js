const db = require("../db/index");
const bcrypt = require("bcrypt");

const saltRounds = 10;

exports.fetchUserByUsernamePassword = (username, password) => {
  return db
    .query(
      `SELECT username, name, password, email, id, avatar, pronouns FROM users WHERE username = $1;`,
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
    const queryStr = `INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING username, name, password, email, id, avatar, pronouns;`;
    const values = [name, username, email, hashedPassword];

    return db
      .query(queryStr, values)
      .then(({ rows }) => {
        return rows[0];
      })
      .catch((err) => {
        if (err.code === "23505" && err.constraint === "users_username_key") {
          return Promise.reject({
            status: 409,
            msg: "Username already exists!",
          });
        }
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

  const keys = Object.keys(newData);
  const values = Object.values(newData);

  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");

  const queryStr = `
    UPDATE users 
    SET ${setClause} 
    WHERE id = $${keys.length + 1} 
    RETURNING name, username, email, avatar, id, pronouns;
  `;

  return db
    .query(queryStr, [...values, id])
    .then(({ rows }) => rows[0])
    .catch((err) => {
      if (err.code === "23505" && err.constraint === "users_username_key") {
        return Promise.reject({
          status: 409,
          msg: "Username already exists!",
        });
      }
    });
};

exports.updateUserPassword = (userData, newPassword) => {
  const { id } = userData;

  return bcrypt.hash(newPassword, saltRounds).then((hashedPassword) => {
    const queryStr = `UPDATE users SET password = $1 WHERE id = $2 RETURNING name, username, email, avatar, id`;

    return db.query(queryStr, [hashedPassword, id]).then(({ rows }) => {
      return rows[0];
    });
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
  const { isbn } = newBook;

  return db
    .query(
      `INSERT INTO bookshelf (user_id, isbn) VALUES ($1, $2) RETURNING *`,
      [id, isbn]
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
  const { isbn, rating = null, review = null } = newBook;

  return db
    .query(
      `INSERT INTO booksjournal (user_id, isbn, rating, review) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *;`,
      [id, isbn, rating, review]
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
         RETURNING user_id, isbn
       )
       INSERT INTO booksjournal (isbn, user_id, date_read, rating, review)
       SELECT m.isbn, m.user_id, CURRENT_DATE, $3, $4
       FROM moved_book m
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

exports.updateRating = (update, user_id) => {
  const { isbn, rating } = update;

  return db
    .query(
      "UPDATE booksjournal SET rating = $1 WHERE user_id = $2 AND isbn = $3 RETURNING *",
      [rating, user_id, isbn]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.updateReview = (update, user_id) => {
  const { isbn, review } = update;

  return db
    .query(
      "UPDATE booksjournal SET review = $1 WHERE user_id = $2 AND isbn = $3 RETURNING *",
      [review, user_id, isbn]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.sendFriendRequest = (userId, friendId) => {
  return db
    .query(
      `SELECT * FROM friendships 
       WHERE (user_id = $1 AND friend_id = $2) 
          OR (user_id = $2 AND friend_id = $1);`,
      [userId, friendId]
    )
    .then(({ rows }) => {
      if (rows.length > 0) {
        // If a friendship already exists in either direction
        throw { status: 409, msg: "Friend request already exists." };
      }

      return db.query(
        `INSERT INTO friendships (user_id, friend_id, status) 
         VALUES ($1, $2, 'pending') RETURNING *;`,
        [userId, friendId]
      );
    });
};

exports.addFriend = (userId, friendId) => {
  return db
    .query(
      `UPDATE friendships 
       SET status = 'accepted' 
       WHERE (user_id = $1 AND friend_id = $2 OR user_id = $2 AND friend_id = $1)
       AND status = 'pending' 
       RETURNING *;`,
      [userId, friendId]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        throw { status: 400, msg: "No pending friend request to accept." };
      }
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
      WHERE (f.friend_id = $1)
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
