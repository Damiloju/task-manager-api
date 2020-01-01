const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOne, userOneID, setUpDatabase } = require("./fixtures/db");

beforeEach(setUpDatabase);

test("should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Dami",
      email: "dami@example.com",
      password: "Mypass1020"
    })
    .expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: {
      name: "Dami",
      email: "dami@example.com"
    }
  });
});

test("should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200);

  const user = await User.findById(userOneID);

  expect(response.body.token).toBe(user.tokens[1].token);
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

  const user = await User.findById(userOneID);

  expect(user).toBeNull();
});

test("should not delete account for unauthorized user", async () => {
  await request(app)
    .delete("/users/me")
    .expect(401);
});

test("should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile.jpeg")
    .expect(200);

  const user = await User.findById(userOneID);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ name: "Bolanle" })
    .expect(200);

  const user = await User.findById(userOneID);

  expect(user.name).toBe("Bolanle");
});

test("should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ location: "Bolanle" })
    .expect(400);
});
