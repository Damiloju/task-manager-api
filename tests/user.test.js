const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");

const userOne = {
    name: "Mike",
    email: "mike@example.com",
    password: "Wosmdk12333"
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
    await request(app).post("/users/login").send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);
});