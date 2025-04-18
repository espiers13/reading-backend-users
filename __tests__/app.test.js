const db = require("../db/index");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index.js");
const request = require("supertest");
const app = require("../app.js");
require("jest-sorted");

beforeEach(() => {
  return seed(testData);
});
afterAll(() => {
  return db.end();
});

describe("POST /api/login - Authenticate user", () => {
  test("Status 200: returns user data when correct username and password are given", async () => {
    return request(app)
      .post("/api/login")
      .send({ username: "bob_smith", password: "Secure#5678" })
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject({
          name: "Bob Smith",
          username: "bob_smith",
          email: "bob.smith@example.com",
          id: 2,
        });
      });
  });

  test("Status 401: Invaid password", () => {
    const credentials = {
      username: "bob_smith",
      password: "notthepassword",
    };

    return request(app)
      .post("/api/login")
      .send(credentials)
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toEqual("Invalid password");
      });
  });
});

describe("POST /api/signup - Create new user", () => {
  test("Status 201: Accepts a newUser object and returns user", () => {
    const newUser = {
      name: "Emily Spiers",
      username: "emily",
      email: "test@test.com",
      password: "thisisapassword",
    };

    return request(app)
      .post("/api/signup")
      .send(newUser)
      .expect(201)
      .then(({ body }) => {
        expect(body).toHaveProperty("name");
        expect(body).toHaveProperty("username");
        expect(body).toHaveProperty("email");
        expect(body).toHaveProperty("password");
        expect(body).toHaveProperty("avatar");
        expect(body.id).toBe(7);
      });
  });
  test("Status 201: Returns user with an encrypted password", () => {
    const newUser = {
      name: "Emily Spiers",
      username: "emily",
      email: "test@test.com",
      password: "thisisapassword",
    };

    return request(app)
      .post("/api/signup")
      .send(newUser)
      .expect(201)
      .then(({ body }) => {
        expect(body.password).not.toBe(newUser.password);
      });
  });
});

describe("GET /api/user/:user_id - Get username by ID", () => {
  test("Status 200: Returns an object containing username when passed a user_id", () => {
    return request(app)
      .get(`/api/user/1`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          username: "alice_j",
          avatar:
            "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg",
        });
      });
  });
  test("Status 404: Returns appropriate status code and error message when user_id does not exist", () => {
    return request(app)
      .get(`/api/user/10`)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("User not found");
      });
  });
});

describe("GET /api/user/:username - Get user_id by username", () => {
  test("Status 200: Returns an object containing user_id when passed a username", () => {
    return request(app)
      .get(`/api/user/e.spiers13`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          username: "e.spiers13",
          id: 6,
        });
      });
  });
  test("Status 404: Returns appropriate status code and error message when username does not exist", () => {
    return request(app)
      .get(`/api/user/notauser`)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("User not found");
      });
  });
});

describe("DELETE /api/user/delete - Delete user by credentials", () => {
  test("Status 204: Deletes user when username and password match, returns an empty object", () => {
    const credentials = { username: "bob_smith", password: "Secure#5678" };
    return request(app)
      .delete(`/api/user/delete`)
      .send(credentials)
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test("Status 401: Returns appropriate error code and message when incorrect password is sent through", () => {
    const credentials = { username: "bob_smith", password: "notthepassword" };
    return request(app)
      .delete(`/api/user/delete`)
      .send(credentials)
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid password");
      });
  });
});

describe("PATCH /api/user - Update user information", () => {
  test("Status 201: Updates user data when passed through new data and correct password/username", () => {
    const body = {
      username: "bob_smith",
      password: "Secure#5678",
      newData: {
        email: "new@email.com",
      },
    };

    const expected = {
      name: "Bob Smith",
      username: "bob_smith",
      email: "new@email.com",
      avatar:
        "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg",
      id: 2,
    };

    return request(app)
      .patch("/api/user")
      .send(body)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual(expected);
      });
  });
  test("Status 401: Returns appropriate error code and message when incorrect password is sent through", () => {
    const credentials = {
      username: "bob_smith",
      password: "notthepassword",
      newData: {
        email: "new@email.com",
      },
    };
    return request(app)
      .patch("/api/user")
      .send(credentials)
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid password");
      });
  });
});

describe("PATCH /api/user/password - Update user password", () => {
  test.only("Status 201: Updates user password when passed through new password and correct password/username", async () => {
    const input = {
      username: "bob_smith",
      password: "Secure#5678",
      newPassword: "newpassword",
    };

    await request(app).patch("/api/user/password").send(input).expect(201);

    return request(app)
      .post("/api/login")
      .send({ username: "bob_smith", password: "newpassword" })
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject({
          name: "Bob Smith",
          username: "bob_smith",
          email: "bob.smith@example.com",
          id: 2,
        });
      });
  });
});

describe("GET /api/journal/:username - Get journal by username", () => {
  test("Status 200: Returns an array containing journaled book objects when passed a username", () => {
    return request(app)
      .get(`/api/journal/alice_j`)
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        expect(body).toBeSorted({
          comparing: (book) => new Date(book.date_read),
          descending: true,
        });
        expect(body.length).toBeGreaterThan(0);
        body.forEach((user) => {
          expect(user).toHaveProperty("isbn");
        });
      });
  });
  test("Status 404: Returns appropriate status code and error message when user_id does not exist", () => {
    return request(app)
      .get(`/api/user/10`)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("User not found");
      });
  });
});

describe("GET /api/bookshelf/:username - Get bookshelf by username", () => {
  test("Status 200: Returns an array containing bookshelf book objects when passed a username", () => {
    return request(app)
      .get(`/api/bookshelf/alice_j`)
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
        body.forEach((user) => {
          expect(user).toHaveProperty("isbn");
        });
      });
  });
  test("Status 404: Returns appropriate status code and error message when user_id does not exist", () => {
    return request(app)
      .get(`/api/user/10`)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("User not found");
      });
  });
});

describe("POST /api/bookshelf - Add a new book to bookshelf", () => {
  test("Status 201: Posts a new book object to bookshelf database, linking to user_id when correct username and password are passed through", () => {
    const input = {
      user_id: 1,
      newBook: {
        isbn: "9780743273565",
      },
    };
    return request(app)
      .post(`/api/bookshelf`)
      .send(input)
      .then(({ body }) => {
        expect(body.isbn).toBe("9780743273565");
      });
  });
});

describe("DELETE /api/bookshelf/:user_id?isbn=[isbn] - Delete a book from the bookshelf", () => {
  test("Status 204: Deletes a book from users bookshelf when passed an isbn and user_id", () => {
    return request(app)
      .delete(`/api/bookshelf/1?isbn="9780140449136"`)
      .expect(204);
  });
});

describe("POST /api/journal - Add a new book to journal", () => {
  test("Status 201: Posts a new book object to journal database, linking to user_id when correct username and password are passed through", () => {
    const input = {
      user_id: "1",
      newBook: {
        isbn: "9780743273565",
        rating: 4,
      },
    };

    return request(app)
      .post(`/api/journal`)
      .send(input)
      .then(({ body }) => {
        expect(body).toHaveProperty("id");
        expect(body).toHaveProperty("user_id");
        expect(body).toHaveProperty("rating");
        expect(body).toHaveProperty("review");
        expect(body).toHaveProperty("date_read");
      });
  });
});

describe("DELETE /api/journal/:user_id?isbn=[isbn]` - Delete a book from the journal", () => {
  test("Status 204: Deletes a book from users journal when passed an isbn and user_id", () => {
    return request(app).delete(`/api/journal/1?isbn=9780385533225`).expect(204);
  });
});

describe("PATCH /api/bookshelf/:user_id/move - Move book from bookshelf to journal", () => {
  test("Status 201: Deletes book data from bookshelf and adds it to the journal instead. Returns journal data", () => {
    const input = {
      isbn: "9781501173219",
      rating: 3,
      review: "It was good!",
    };

    return request(app)
      .patch("/api/bookshelf/2/move")
      .send(input)
      .expect(201)
      .then(({ body }) => {
        expect(body).toHaveProperty("id");
        expect(body).toHaveProperty("user_id");
        expect(body).toHaveProperty("rating");
        expect(body).toHaveProperty("review");
        expect(body).toHaveProperty("date_read");
      });
  });

  test("Status 404: Returns appropriate error code and message when isbn does not exist in the users journal", () => {
    const input = {
      isbn: "9780743273565",
      rating: 3,
      review: "It was good!",
    };
    return request(app)
      .patch("/api/bookshelf/2/move")
      .send(input)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Book not found");
      });
  });
});

describe("POST /api/bookshelf/:user_id/read - log book as read in the journal", () => {
  test("Status 201: logs book as read and returns new book data", () => {
    const input = {
      isbn: "9781526634269",
      rating: 5,
      review: "Loved it!",
    };
    const user_id = 6;
    return request(app)
      .post(`/api/bookshelf/${user_id}/read`)
      .send(input)
      .expect(201)
      .then(({ body }) => {
        expect(body).toHaveProperty("id");
        expect(body).toHaveProperty("user_id");
        expect(body).toHaveProperty("rating");
        expect(body).toHaveProperty("review");
        expect(body).toHaveProperty("date_read");
      });
  });
  test("Status 201: moves book from bookshelf to journal if book exists in bookshelf", () => {
    const input = {
      isbn: "9780349436982",
      rating: 5,
      review: "Loved it!",
    };
    const user_id = 6;
    return request(app)
      .post(`/api/bookshelf/${user_id}/read`)
      .send(input)
      .expect(201)
      .then(({ body }) => {
        expect(body).toHaveProperty("id");
        expect(body).toHaveProperty("user_id");
        expect(body).toHaveProperty("rating");
        expect(body).toHaveProperty("review");
        expect(body).toHaveProperty("date_read");
      });
  });
});

describe("PATCH /api/journal/:user_id - update book rating or review with user_id and isbn", () => {
  test("Status 200: Returns book in journal with updated rating", () => {
    const input = { rating: 5, isbn: "9781526635365" };
    const user_id = 6;

    return request(app)
      .patch(`/api/journal/${user_id}`)
      .send(input)
      .expect(200)
      .then(({ body }) => {
        expect(body.rating).toBe("5.0");
      });
  });
  test("Status 200: Returns book in journal with updated review", () => {
    const input = { review: "Loved it!", isbn: "9781526635365" };
    const user_id = 6;

    return request(app)
      .patch(`/api/journal/${user_id}`)
      .send(input)
      .expect(200)
      .then(({ body }) => {
        expect(body.review).toBe("Loved it!");
      });
  });
});

describe("POST /api/friends/request/:friend_id - Send a friend request", () => {
  test("Status 200: Inserts a new friend request into friendships table with status: pending", () => {
    const input = { user_id: 1 };
    return request(app)
      .post("/api/friends/request/4")
      .send(input)
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe("Friend request sent to david_b!");
      });
  });
});

describe("PATCH /api/friends/accept/:friend_id - Accept a friend request", () => {
  test("Status 200: Changes friend request status to accepted", async () => {
    const input = { user_id: 1 };

    await request(app).post("/api/friends/request/4").send(input).expect(200);

    return request(app)
      .patch("/api/friends/accept/4")
      .send(input)
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe("You are now friends with david_b!");
      });
  });
});

describe("GET /api/friends/:user_id - See all friends", () => {
  test("Status 200: Returns an array of all friend_id user is friends with", async () => {
    const input = { user_id: 1 };

    // Step 1: Send a friend request
    await request(app).post("/api/friends/request/4").send(input).expect(200);

    // Step 2: Accept the friend request
    await request(app).patch("/api/friends/accept/4").send(input).expect(200);

    // Step 3: Get the friends list
    return request(app)
      .get("/api/friends/1")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
        body.forEach((friendship) => {
          expect(friendship.status).toBe("accepted");
        });
      });
  });
});

describe("GET /api/friends/pending/:username - See all pending friend requests", () => {
  test("Status 200: Returns an array of all friend_id user is friends with", async () => {
    const input = { user_id: 1 };

    // Step 1: Send a friend request
    await request(app).post("/api/friends/request/4").send(input).expect(200);

    // Step 2: Get the pending friends list
    return request(app)
      .get("/api/friends/pending/4")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
        body.forEach((friendship) => {
          expect(friendship.status).toBe("pending");
        });
      });
  });
});

describe("GET /api/:user_id/favourites - Get favourites by user_id", () => {
  test("Status 200: Returns an array of objects containing isbns linking to given user_id", () => {
    return request(app)
      .get("/api/6/favourites")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
        body.forEach((favourite) => {
          expect(favourite).toHaveProperty("isbn");
        });
      });
  });
  test("Status 200: Returns an empty array when user has no favourites", () => {
    return request(app)
      .get("/api/1/favourites")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual([]);
      });
  });
  test("Status 404: Returns appropriate status code and message when user does not exist", () => {
    return request(app)
      .get("/api/15/favourites")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User not found");
      });
  });
});

describe("POST /api/favourites - Post new book to favourites", () => {
  test("Status 201: posts a new book to users favourites when given correct credentials, then returns added book data", () => {
    const input = {
      user_id: "6",
      newBook: { isbn: "9781398515703" },
    };
    return request(app)
      .post("/api/favourites")
      .send(input)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual({ id: 13, user_id: 6, isbn: "9781398515703" });
      });
  });
  test("Status 409: returns appropriate status code and message when book already exists in favourites", () => {
    const input = {
      user_id: "6",
      newBook: { isbn: "9781526635297" },
    };
    return request(app)
      .post("/api/favourites")
      .send(input)
      .expect(409)
      .then(({ body }) => {
        expect(body.msg).toBe(
          'error: duplicate key value violates unique constraint "favourites_user_id_isbn_key"'
        );
      });
  });
  test("Status 400: returns appropriate status code and message when user already has 3 books in favourites", () => {
    const input = {
      user_id: 2,
      newBook: { isbn: "9781526635297" },
    };
    return request(app)
      .post("/api/favourites")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("User can only have 3 favorite books");
      });
  });
});

describe.only("DELETE /api/favourites - Delete book from favourites", () => {
  test("Status 204: Deletes book from favourites when passed through correct credentils, and a book isbn", () => {
    const input = {
      user_id: 6,
      isbn: "9780439139601",
    };
    return request(app).post("/api/favourites/delete").send(input).expect(204);
  });
});
