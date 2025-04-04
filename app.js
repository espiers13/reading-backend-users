const express = require("express");
const app = express();
const cors = require("cors");

const {
  getUserByCredentials,
  postNewUser,
  getUserById,
  deleteUserByCredentials,
  patchUserData,
  postBookshelf,
  getJournalByUser,
  getBookshelfByUser,
  deleteFromBookshelf,
  postJournal,
  deleteFromJournal,
  markBookAsRead,
  friendRequest,
  acceptFriendRequest,
  getFriendsList,
  getPendingFriendsList,
  getFavouritesByUserId,
  postNewFavourite,
  deleteFromFavourites,
} = require("./controllers/user-controllers");

const {
  handlePSQLErrors,
  handleCustomErrors,
  handleServerErrors,
} = require("./errors/errors");

// MIDDLEWARE

app.use(express.json());
app.use(cors());

// LOGIN REQUEST

app.post("/api/login", getUserByCredentials);

// NEW USER REQUEST

app.post("/api/signup", postNewUser);

// GET USER BY ID

app.get("/api/user/:user_id", getUserById);

// DELETE USER REQUEST

app.delete("/api/user/delete", deleteUserByCredentials);

// UPDATE USER DETAILS

app.patch("/api/user", patchUserData);

// GET READ JOURNAL BY USERNAME

app.get("/api/journal/:username", getJournalByUser);

// GET BOOKSHELF BY USERNAME

app.get("/api/bookshelf/:username", getBookshelfByUser);

// ADD BOOK TO BOOKSHELF (books to read)

app.post("/api/bookshelf", postBookshelf);

// REMOVE BOOK FROM BOOKSHELF

app.delete("/api/bookshelf/:user_id", deleteFromBookshelf);

// ADD A BOOK TO READ JOURNAL

app.post("/api/journal", postJournal);

// REMOVE BOOK FROM READ JOURNAL

app.delete("/api/journal/:user_id", deleteFromJournal);

// MOVE BOOK FROM BOOKSHELF TO READ LIST

app.patch("/api/bookshelf/:user_id/move", markBookAsRead);

// SEND FRIEND REQUEST

app.post("/api/friends/request/:friend_id", friendRequest);

// ACCEPT FRIEND REQUEST

app.post("/api/friends/accept/:friend_id", acceptFriendRequest);

// GET FRIENDS LIST

app.get("/api/friends/:user_id", getFriendsList);

// GET PENDING FRIENDS LIST

app.get("/api/friends/pending/:user_id", getPendingFriendsList);

// GET FAVOURITES

app.get("/api/:user_id/favourites", getFavouritesByUserId);

// POST NEW FAVOURITE

app.post("/api/favourites", postNewFavourite);

// DELETE FAVOURITE

app.delete("/api/favourites", deleteFromFavourites);

app.use(handlePSQLErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
