const db = require("../db/index");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index.js");
const request = require("supertest");
const app = require("../app.js");

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
