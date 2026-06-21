# Dear Reader — Users Backend
 
A RESTful API for the Dear Reader app, built with Node.js, Express, and PostgreSQL. Handles user accounts, bookshelves, reading journals, favourites, currently-reading lists, and friends, for the [Dear Reader frontend](https://github.com/espiers13/read-logging-app).
 
## Live API
 
https://dear-reader-backend.onrender.com
 
## Getting Started
 
### Prerequisites
 
- Node.js v18+
- PostgreSQL
### Installation
 
1. Clone the repo:
```bash
git clone https://github.com/espiers13/reading-backend-users.git
cd reading-backend-users
```
 
2. Install dependencies:
```bash
npm install
```
 
3. Create the following environment files in the root directory:
**.env.development**
```
PGDATABASE=dear_reader_users
```
 
**.env.test**
```
PGDATABASE=dear_reader_users_test
```
 
4. Set up the databases:
```bash
npm run setup-dbs
```
 
5. Seed the development database:
```bash
npm run seed
```
 
## Running Tests
 
```bash
npm test
```
 
## API Endpoints
 
### Auth & Account
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Authenticate user, returns user details |
| POST | `/api/signup` | Create a new user |
| GET | `/api/user/:user` | Get a user's username and avatar |
| POST | `/api/search/users` | Search for users |
| POST | `/api/user/delete` | Delete a user account |
| PATCH | `/api/user` | Update user details |
| PATCH | `/api/user/password` | Update user password |
 
### Bookshelf
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookshelf/:username` | Get a user's bookshelf |
| POST | `/api/bookshelf` | Add a book to a user's bookshelf |
| DELETE | `/api/bookshelf/:user_id` | Remove a book from a user's bookshelf |
| PATCH | `/api/bookshelf/:user_id/move` | Move a book from bookshelf to read journal |
| POST | `/api/bookshelf/:user_id/read` | Mark a book as read |
 
### Reading Journal
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/journal/:username` | Get a user's read journal |
| POST | `/api/journal` | Add a book to a user's read journal |
| DELETE | `/api/journal/:user_id` | Remove a book from a user's read journal |
| PATCH | `/api/journal/:user_id` | Update a journal entry (e.g. rating, review) |
 
### Currently Reading
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/:user_id/currentlyreading` | Get a user's currently-reading book(s) |
| POST | `/api/:user_id/currentlyreading` | Set a book as currently reading |
| DELETE | `/api/:user_id/currentlyreading` | Remove a book from currently reading |
| PATCH | `/api/:user_id/currentlyreading/move` | Move a book from currently reading to the read journal |
 
### Favourites
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/:user_id/favourites` | Get a user's favourite books |
| POST | `/api/favourites` | Add a new favourite |
| POST | `/api/favourites/delete` | Remove a favourite |
 
### Friends
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/friends/request/:friend_id` | Send a friend request |
| PATCH | `/api/friends/accept/:friend_id` | Accept a friend request |
| POST | `/api/friends/delete/:friend_id` | Remove a friend |
| GET | `/api/friends/:user_id` | Get a user's friends list |
| GET | `/api/friends/pending/:user_id` | Get a user's pending friend requests |
 
## Tech Stack
 
- **Node.js** & **Express** — server and routing
- **PostgreSQL** & **node-postgres (pg)** — database
- **bcrypt** — password hashing
- **pg-format** — safe SQL query formatting
- **dotenv** — environment variable management
- **Jest**, **jest-sorted** & **Supertest** — testing
## Scripts
 
| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Start the server |
| Setup DBs | `npm run setup-dbs` | Create the dev and test databases |
| Seed | `npm run seed` | Seed the development database |
| Seed (test) | `npm run seed-test` | Seed the test database |
| Seed (prod) | `npm run seed-prod` | Seed the production database |
| Test | `npm test` | Run the test suite |
 
## Project Structure
 
```
.
├── app.js                       # Express app: middleware and route definitions
├── listen.js                    # Starts the server
├── controllers/
│   └── user-controllers.js      # Auth, bookshelf, journal, favourites, friends logic
├── models/
│   └── user-models.js           # Database queries
├── errors/
│   └── errors.js                # PSQL, custom, and server error handlers
├── db/
│   ├── index.js                 # Database connection
│   ├── setup.sql                # Creates dev/test databases
│   ├── data/                    # Seed data
│   └── seeds/                   # Seeding scripts
└── __tests__/
    └── app.test.js               # Endpoint tests (Jest + Supertest)
```
 
## Related Repos
 
The frontend for this project can be found at: https://github.com/espiers13/read-logging-app
 
