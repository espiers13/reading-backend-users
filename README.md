# Dear Reader - Users Backend Database

Hosted on: Render
https://dear-reader-backend.onrender.com

Dear Reader User Database is an API built for the purpose of accessing user data for a front end application.
This is the backend service which provides user information including books saved and friend lists to the front end architecture.

## Endpoints

### LOGIN REQUEST:

POST /api/login
accepts: {username: [username], password: [password]}
returns user details

### NEW USER REQUEST

POST /api/signup
accepts: {name: [name], username: [username], email: [email], password: [password]}
returns user details

### GET USERNAME BY ID

GET /api/user/:user_id
returns username and avatar

### DELETE USER REQUEST

DELETE /api/user/delete
accepts: {username: [username], password: [password]}

### UPDATE USER DETAILS

PATCH /api/user
accepts: {username: [username], password: [password], newData: {dataKey: [data]}}

### GET READ JOURNAL BY USERNAME

GET /api/journal/:username
returns array of books in read journal

### GET BOOKSHELF BY USERNAME

GET /api/bookshelf/:username
returns array of books in bookshelf

### ADD BOOK TO BOOKSHELF

POST /api/bookshelf/:username
accepts: {password: [password], newBook: {isbn: [isbn], title: [title]}}

### REMOVE BOOK FROM BOOKSHELF

DELETE /api/bookshelf/:username
accepts: {password: [password], isbn: [isbn]}

### ADD A BOOK TO READ JOURNAL

POST /api/journal/:username
accepts: {password: [password], newBook: {isbn: [isbn], title: [title]}}

### REMOVE BOOK FROM READ JOURNAL

DELETE /api/bookshelf/:username
accepts: {password: [password], isbn: [isbn]}

### MOVE BOOK FROM BOOKSHELF TO READ JOURNAL

PATCH /api/bookshelf/:username/move
accepts: {password: [password], isbn: [isbn], rating: [rating], review: [review]}

### SEND FRIEND REQUEST

POST /api/friends/request/:friend_id
accepts: {username: [username], password: [password]}

### ACCEPT FRIEND REQUEST

POST /api/friends/accept/:friend_id
accepts: {username: [username], password: [password]}

### GET FRIENDS LIST

GET /api/friends/:username
accepts: {password: [password]}

### GET PENDING FRIENDS LIST

GET /api/friends/pending/:username
accepts: {password: [password]}

## Dependencies

This datbase is run with PostgreSQL and node-postgres.

To install PostgreSQL: https://www.w3schools.com/postgresql/postgresql_install.php

To install npm:
npm install npm@latest -g

## Installation:

1. Clone the repo:
   https://github.com/espiers13/hidden-gems.git

2. Install dependencies:
   npm install

3. devDependencies used:
   {
   "husky": "^8.0.2",
   "jest": "^29.6.2",
   "supertest": "^6.1.3"
   }

4. In order to successfully connect the two databases in be-nc-news locally the following files must be added:
   .env.development
   .env.test

These files must contain the following:
.env.development --> PGDATABASE=virtually_curated
.env.test --> PGDATABASE=virtually_curated_test

5. In order to set up the database run command:
   npm run setup-dbs

6. To seed the local database run command:
   npm run seed

7. Tests are run using jest supertest. To run tests use command:
   npm run test
