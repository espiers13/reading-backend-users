const express = require("express");
const app = express();
const cors = require("cors");

const {
  getUserByCredentials,
  postNewUser,
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

app.use(handlePSQLErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
