const {
  fetchUserByUsernamePassword,
  createNewUser,
  fetchUserById,
  removeUserData,
  updateUserData,
  fetchIdByUsername,
  fetchJournalById,
  fetchBookshelfById,
  postToBookshelf,
  removeFromBookshelf,
  postToJournal,
  removeFromJournal,
  moveBookToJournal,
  sendFriendRequest,
  addFriend,
  fetchFriendsList,
  fetchPendingList,
  fetchFavouritesByUserId,
  postFavouriteById,
  removeFromFavourites,
} = require("../models/user-models");

exports.getUserByCredentials = (req, res, next) => {
  const { username, password } = req.body;

  fetchUserByUsernamePassword(username, password)
    .then((userData) => {
      res.status(200).send(userData);
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

exports.getUser = (req, res, next) => {
  const { user } = req.params;

  if (/^\d+$/.test(user)) {
    fetchUserById(user)
      .then((userData) => {
        res.status(200).send(userData);
      })
      .catch((err) => {
        next(err);
      });
  } else {
    fetchIdByUsername(user)
      .then((userData) => {
        res.status(200).send(userData);
      })
      .catch((err) => {
        next(err);
      });
  }
};

exports.deleteUserByCredentials = (req, res, next) => {
  const { username, password } = req.body;

  fetchUserByUsernamePassword(username, password)
    .then((userData) => {
      removeUserData(userData).then(() => {
        res.sendStatus(204);
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchUserData = (req, res, next) => {
  const { username, password, newData } = req.body;
  fetchUserByUsernamePassword(username, password)
    .then((userData) => {
      updateUserData(userData, newData).then((updatedData) => {
        res.status(201).send(updatedData);
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getJournalByUser = (req, res, next) => {
  const { username } = req.params;

  fetchIdByUsername(username)
    .then(({ id }) => {
      fetchJournalById(id).then((journalData) => {
        res.status(200).send(journalData);
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getBookshelfByUser = (req, res, next) => {
  const { username } = req.params;

  fetchIdByUsername(username)
    .then(({ id }) => {
      fetchBookshelfById(id).then((journalData) => {
        res.status(200).send(journalData);
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postBookshelf = (req, res, next) => {
  const { user_id, newBook } = req.body;

  postToBookshelf(user_id, newBook)
    .then((bookData) => {
      res.status(201).send(bookData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteFromBookshelf = (req, res, next) => {
  const { isbn } = req.query; // ISBN from the query parameter
  const { user_id } = req.params;

  removeFromBookshelf(isbn, user_id)
    .then((bookData) => {
      res.status(204).send(bookData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.postJournal = (req, res, next) => {
  const { user_id, newBook } = req.body;

  postToJournal(user_id, newBook)
    .then((bookData) => {
      res.status(201).send(bookData);
    })
    .catch((err) => {
      console.error("Error in postJournal:", err); // Add this for better debugging
      next(err);
    });
};
exports.deleteFromJournal = (req, res, next) => {
  const { isbn } = req.query; // ISBN from the query parameter
  const { user_id } = req.params;

  removeFromJournal(isbn, user_id)
    .then((bookData) => {
      res.status(204).send(bookData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.markBookAsRead = (req, res, next) => {
  const { isbn, rating = null, review = null } = req.body;
  const { user_id } = req.params;

  moveBookToJournal(isbn, user_id, rating, review)
    .then((bookData) => {
      res.status(201).send(bookData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.logBookAsRead = (req, res, next) => {
  const { isbn, rating = null, review = null } = req.body;
  const { user_id } = req.params;
  const newBook = { isbn, rating, review };

  fetchBookshelfById(user_id).then((bookshelfData) => {
    if (bookshelfData.some((book) => book.isbn === isbn)) {
      //if the book does exist in bookshelf
      moveBookToJournal(isbn, user_id, rating, review)
        .then((bookData) => {
          res.status(201).send(bookData);
        })
        .catch((err) => {
          console.error(err);
          next(err);
        });
    }
    if (!bookshelfData.some((book) => book.isbn === isbn)) {
      //if book does not exist in bookshelf
      postToJournal(user_id, newBook)
        .then((bookData) => {
          res.status(201).send(bookData);
        })
        .catch((err) => {
          console.error(err);
          next(err);
        });
    }
  });
};

exports.friendRequest = (req, res, next) => {
  const { friend_id } = req.params;
  const { user_id } = req.body;

  fetchUserById(friend_id)
    .then(({ username }) => {
      sendFriendRequest(user_id, friend_id)
        .then(() => {
          res.status(200).send({ msg: `Friend request sent to ${username}!` });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.acceptFriendRequest = (req, res, next) => {
  const { friend_id } = req.params;
  const { user_id } = req.body;

  fetchUserById(friend_id)
    .then(({ username }) => {
      addFriend(user_id, friend_id)
        .then(() => {
          res
            .status(200)
            .send({ msg: `You are now friends with ${username}!` });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getFriendsList = (req, res, next) => {
  const { user_id } = req.params;

  fetchFriendsList(user_id)
    .then((friendsList) => {
      res.status(200).send(friendsList);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getPendingFriendsList = (req, res, next) => {
  const { user_id } = req.params;

  fetchPendingList(user_id)
    .then((friendsList) => {
      res.status(200).send(friendsList);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getFavouritesByUserId = (req, res, next) => {
  const { user_id } = req.params;

  fetchFavouritesByUserId(user_id)
    .then((favouritesData) => {
      res.status(200).send(favouritesData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.postNewFavourite = (req, res, next) => {
  const { user_id, newBook } = req.body;

  postFavouriteById(user_id, newBook)
    .then((postedBook) => {
      res.status(201).send(postedBook);
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteFromFavourites = (req, res, next) => {
  const { user_id, isbn } = req.body;

  removeFromFavourites(user_id, isbn)
    .then((deletedBook) => {
      res.status(204).send(deletedBook);
    })
    .catch((err) => {
      next(err);
    });
};
