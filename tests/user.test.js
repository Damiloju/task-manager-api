const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/user");

const userOneID = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneID,
  name: "Mike",
  email: "mike@example.com",
  password: "Wosmdk12333",
  tokens: [
    {
      token: jwt.sign(
        {
          _id: userOneID
        },
        process.env.JWT_SECRET
      )
    }
  ]
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test("should signup a new user", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "Dami",
      email: "dami@example.com",
      password: "Mypass1020"
    })
    .expect(201);
});

test("should login existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200);
});

test("should not log in nonexistent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "user@example.com",
      password: userOne.password
    })
    .expect(400);
});

test("should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200);
});

test("should not get profile for unauthorized user", async () => {
  await request(app)
    .get("/users/me")
    .expect(401);
});

test("should delete account for user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200);
});

test("should not delete account for unauthorized user", async () => {
  await request(app)
    .delete("/users/me")
    .expect(401);
});
