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

exports.getUserById = (req, res, next) => {
  const { user_id } = req.params;
  fetchUserById(user_id)
    .then((userData) => {
      res.status(200).send(userData);
    })
    .catch((err) => {
      next(err);
    });
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
  const { password, newBook } = req.body;
  const { username } = req.params;

  fetchUserByUsernamePassword(username, password)
    .then(({ id }) => {
      postToBookshelf(id, newBook).then((bookData) => {
        res.status(201).send(bookData);
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteFromBookshelf = (req, res, next) => {
  const { password, isbn } = req.body;
  const { username } = req.params;

  fetchUserByUsernamePassword(username, password)
    .then(({ id }) => {
      removeFromBookshelf(isbn, id)
        .then((bookData) => {
          res.status(204).send(bookData);
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postJournal = (req, res, next) => {
  const { password, newBook } = req.body;
  const { username } = req.params;

  fetchUserByUsernamePassword(username, password)
    .then(({ id }) => {
      postToJournal(id, newBook)
        .then((bookData) => {
          res.status(201).send(bookData);
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteFromJournal = (req, res, next) => {
  const { password } = req.body; // Password from the request body
  const { isbn } = req.query; // ISBN from the query parameter
  const { username } = req.params;

  fetchUserByUsernamePassword(username, password)
    .then(({ id }) => {
      removeFromJournal(isbn, id)
        .then((bookData) => {
          res.status(204).send(bookData);
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.markBookAsRead = (req, res, next) => {
  const { password, isbn, rating = null, review = null } = req.body;
  const { username } = req.params;

  fetchUserByUsernamePassword(username, password)
    .then(({ id }) => {
      moveBookToJournal(isbn, id, rating, review)
        .then((bookData) => {
          res.status(201).send(bookData);
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.friendRequest = (req, res, next) => {
  const { friend_id } = req.params;
  const { username, password } = req.body;
  const currentUser = username;

  fetchUserById(friend_id)
    .then(({ username }) => {
      fetchUserByUsernamePassword(currentUser, password)
        .then(({ id }) => {
          sendFriendRequest(id, friend_id)
            .then(() => {
              res
                .status(200)
                .send({ msg: `Friend request sent to ${username}!` });
            })
            .catch((err) => {
              next(err);
            });
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
  const { username, password } = req.body;
  const currentUser = username;

  fetchUserById(friend_id)
    .then(({ username }) => {
      fetchUserByUsernamePassword(currentUser, password)
        .then(({ id }) => {
          addFriend(id, friend_id)
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
    })
    .catch((err) => {
      next(err);
    });
};

exports.getFriendsList = (req, res, next) => {
  const { username } = req.params;
  const { password } = req.body;

  fetchUserByUsernamePassword(username, password)
    .then(({ id }) => {
      fetchFriendsList(id)
        .then((friendsList) => {
          res.status(200).send(friendsList);
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getPendingFriendsList = (req, res, next) => {
  const { username } = req.params;
  const { password } = req.body;

  fetchUserByUsernamePassword(username, password)
    .then(({ id }) => {
      fetchPendingList(id)
        .then((pendingList) => {
          res.status(200).send(pendingList);
        })
        .catch((err) => {
          next(err);
        });
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
  const { username, password, newBook } = req.body;

  fetchUserByUsernamePassword(username, password)
    .then(({ id }) => {
      postFavouriteById(id, newBook)
        .then((postedBook) => {
          res.status(201).send(postedBook);
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteFromFavourites = (req, res, next) => {
  const { username, password } = req.body;
  const { isbn } = req.params;

  fetchUserByUsernamePassword(username, password)
    .then(({ id }) => {
      removeFromFavourites(id, isbn)
        .then((deletedBook) => {
          res.status(204).send(deletedBook);
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};
