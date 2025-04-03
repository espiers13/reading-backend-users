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
        expect(body.id).toBe(6);
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

describe("POST /api/bookshelf/:username - Add a new book to bookshelf", () => {
  test("Status 201: Posts a new book object to bookshelf database, linking to user_id when correct username and password are passed through", () => {
    const input = {
      password: "Pass@1234",
      newBook: {
        isbn: "9780743273565",
        title: "The Great Gatsby",
      },
    };
    const expected = {
      id: 11,
      user_id: 1,
      isbn: "9780743273565",
      title: "The Great Gatsby",
    };
    return request(app)
      .post(`/api/bookshelf/alice_j`)
      .send(input)
      .then(({ body }) => {
        expect(body).toEqual(expected);
      });
  });
  test("Status 401: Returns appropriate error code and message when incorrect password is sent through", () => {
    const input = {
      password: "notthepassword",
      newBook: {
        isbn: "9780743273565",
        title: "The Great Gatsby",
      },
    };

    return request(app)
      .post(`/api/bookshelf/alice_j`)
      .send(input)
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid password");
      });
  });
});

describe("DELETE /api/bookshelf/:username - Delete a book from the bookshelf", () => {
  test("Status 204: Deletes a book from users bookshelf when passed an isbn, and when username and password match", () => {
    const input = {
      password: "Pass@1234",
      isbn: "9780140449136",
    };

    return request(app)
      .delete(`/api/bookshelf/alice_j`)
      .send(input)
      .expect(204);
  });

  test("Status 401: Returns appropriate error code and message when incorrect password is sent through", () => {
    const input = { password: "notthepassword", isbn: "9780140449136" };
    return request(app)
      .delete(`/api/bookshelf/alice_j`)
      .send(input)
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid password");
      });
  });

  test("Status 404: Returns appropriate error code and message when isbn does not exist in the users bookshelf", () => {
    const input = {
      password: "Pass@1234",
      isbn: "9781400032716",
    };
    return request(app)
      .delete(`/api/bookshelf/alice_j`)
      .send(input)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Book not found");
      });
  });
});

describe("POST /api/journal/:username - Add a new book to journal", () => {
  test("Status 201: Posts a new book object to journal database, linking to user_id when correct username and password are passed through", () => {
    const input = {
      password: "Pass@1234",
      newBook: {
        isbn: "9780743273565",
        title: "The Great Gatsby",
        rating: 4,
      },
    };
    const expected = {
      id: 11,
      user_id: 1,
      isbn: "9780743273565",
      title: "The Great Gatsby",
      rating: "4.0",
      review: null,
      date_read: "2025-04-02T23:00:00.000Z",
    };
    return request(app)
      .post(`/api/journal/alice_j`)
      .send(input)
      .then(({ body }) => {
        expect(body).toEqual(expected);
      });
  });
  test("Status 401: Returns appropriate error code and message when incorrect password is sent through", () => {
    const input = {
      password: "notthepassword",
      newBook: {
        isbn: "9780743273565",
        title: "The Great Gatsby",
      },
    };

    return request(app)
      .post(`/api/journal/alice_j`)
      .send(input)
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid password");
      });
  });
});

describe("DELETE /api/journal/:username - Delete a book from the journal", () => {
  test("Status 204: Deletes a book from users journal when passed an isbn, and when username and password match", () => {
    const input = {
      password: "Pass@1234",
      isbn: "9781524763169",
    };

    return request(app).delete(`/api/journal/alice_j`).send(input).expect(204);
  });

  test("Status 401: Returns appropriate error code and message when incorrect password is sent through", () => {
    const input = { password: "notthepassword", isbn: "9781524763169" };
    return request(app)
      .delete(`/api/journal/alice_j`)
      .send(input)
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid password");
      });
  });

  test("Status 404: Returns appropriate error code and message when isbn does not exist in the users journal", () => {
    const input = {
      password: "Pass@1234",
      isbn: "9780553380163",
    };
    return request(app)
      .delete(`/api/journal/alice_j`)
      .send(input)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Book not found");
      });
  });
});

describe("PATCH /api/bookshelf/:username/move - Move book from bookshelf to journal", () => {
  test("Status 201: Deletes book data from bookshelf and adds it to the journal instead. Returns journal data", () => {
    const input = {
      password: "Secure#5678",
      isbn: "9781501173219",
      rating: 3,
      review: "It was good!",
    };

    const expected = {
      id: 11,
      user_id: 2,
      isbn: "9781501173219",
      title: "The Silent Patient",
      rating: "3.0",
      review: "It was good!",
      date_read: "2025-04-02T23:00:00.000Z",
    };

    return request(app)
      .patch("/api/bookshelf/bob_smith/move")
      .send(input)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual(expected);
      });
  });

  test("Status 401: Returns appropriate error code and message when incorrect password is sent through", () => {
    const input = {
      password: "notthepassword",
      isbn: "9781501173219",
      rating: 3,
      review: "It was good!",
    };
    return request(app)
      .patch("/api/bookshelf/bob_smith/move")
      .send(input)
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid password");
      });
  });

  test("Status 404: Returns appropriate error code and message when isbn does not exist in the users journal", () => {
    const input = {
      password: "Secure#5678",
      isbn: "9780743273565",
      rating: 3,
      review: "It was good!",
    };
    return request(app)
      .patch("/api/bookshelf/bob_smith/move")
      .send(input)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Book not found");
      });
  });
});

describe("POST /api/friends/request/:friend_id - Send a friend request", () => {
  test("Status 200: Inserts a new friend request into friendships table with status: pending", () => {
    const input = { username: "alice_j", password: "Pass@1234" };
    return request(app)
      .post("/api/friends/request/4")
      .send(input)
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe("Friend request sent to david_b!");
      });
  });
});

describe("POST /api/friends/accept/:friend_id - Accept a friend request", () => {
  test("Status 200: Changes friend request status to accepted", async () => {
    const input = { username: "alice_j", password: "Pass@1234" };

    await request(app).post("/api/friends/request/4").send(input).expect(200);

    return request(app)
      .post("/api/friends/accept/4")
      .send(input)
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe("You are now friends with david_b!");
      });
  });
});

describe("GET /api/friends/:username - See all friends", () => {
  test("Status 200: Returns an array of all friend_id user is friends with", async () => {
    const input = { username: "alice_j", password: "Pass@1234" };
    const listInput = { password: "Pass@1234" };

    // Step 1: Send a friend request
    await request(app).post("/api/friends/request/4").send(input).expect(200);

    // Step 2: Accept the friend request
    await request(app).post("/api/friends/accept/4").send(input).expect(200);

    // Step 3: Get the friends list
    return request(app)
      .get("/api/friends/alice_j")
      .send(listInput)
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
    const input = { username: "alice_j", password: "Pass@1234" };
    const listInput = { password: "Pass@1234" };

    // Step 1: Send a friend request
    await request(app).post("/api/friends/request/4").send(input).expect(200);

    // Step 2: Get the pending friends list
    return request(app)
      .get("/api/friends/pending/alice_j")
      .send(listInput)
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
