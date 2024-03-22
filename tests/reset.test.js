const request = require("supertest");
const app = require("../index");
const db = require("../src/database/db");

const Blog = require("../src/models/Blog");
const Comment = require("../src/models/Comment");
const Like = require("../src/models/Like");
const Notification = require("../src/models/Notification");
const Post = require("../src/models/Post");
const BlogAccount = require("../src/models/BlogAccount");
const Token = require("../src/models/Token");

beforeAll(async () => {
  try {
    await db.sync({});
    await Blog.sync({ force: true });
    await Comment.sync({ force: true });
    await Like.sync({ force: true });
    await Notification.sync({ force: true });
    await Post.sync({ force: true });
    await BlogAccount.sync({ force: true });
    await Token.sync({ force: true });
  } catch (error) {
    console.log(error.message);
  }
}, 30000);

afterAll((done) => {
  db.close();
  done();
});

let cookie;

let account1_id, account2_id, account3_id;

describe("POST /api/users/account route -> create new user", () => {
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "cunialsourcecodes@gmail.com",
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/users/account").send(user);

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
    account1_id = response.body.data.id;
  });
});

let token;

describe("POST /request/password route -> request password", () => {
  it("it should return 400 status code -> email is missing", async () => {
    const response = await request(app).post("/api/users/request/password");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email is missing");
  });
  it("it should return 404 status code -> account not exists", async () => {
    const response = await request(app)
      .post("/api/users/request/password")
      .send({ email: "user4@fakeapis.io" });
    expect(response.status).toBe(404);
  });
  it("it should return 400 status code -> account not verified", async () => {
    const response = await request(app)
      .post("/api/users/request/password")
      .send({ email: "cunialsourcecodes@gmail.com" });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "Please verify your account before reseting your password!"
    );
  });
  it("it should return 200 status code -> verify account success", async () => {
    const response = await request(app).get(
      `/api/users/account/${account1_id}/verify`
    );
    expect(response.status).toBe(200);
  });
  it("it should return 200 status code -> email sent", async () => {
    const response = await request(app)
      .post("/api/users/request/password")
      .send({ email: "cunialsourcecodes@gmail.com" });
    expect(response.status).toBe(200);
    token = response.body.token;
  });
});

describe("POST /reset/password route -> reset password", () => {
  it("it should return 400 status code -> account id is missing", async () => {
    const response = await request(app).post("/api/users/reset/password");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("accountId is missing");
  });
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app).post("/api/users/reset/password").send({
      accountId: 1,
    });

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("accountId: 1 - Invalid format!");
  });
  it("it should return 404 status code -> account not found", async () => {
    const response = await request(app).post("/api/users/reset/password").send({
      accountId: "380ae108-53b6-4cf9-b0e5-e08bb7dfa372",
    });

    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Account with ID: 380ae108-53b6-4cf9-b0e5-e08bb7dfa372 not found!"
    );
  });
  /*   it("it should return 404 status code -> token not found", async () => {
    const response = await request(app).post("/api/users/reset/password").send({
      accountId: account1_id,
    });

    console.log(response.body);
    expect(response.status).toBe(404);
  }); */
  it("it should return 400 status code -> invalid token", async () => {
    const response = await request(app).post("/api/users/reset/password").send({
      accountId: account1_id,
      token: 1,
    });

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Invalid token!");
  });
  it("it should return 400 status code -> password not match", async () => {
    const response = await request(app).post("/api/users/reset/password").send({
      accountId: account1_id,
      token,
      password: "Password14!",
      password2: "Password14",
    });
    console.log(response.body);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "Password and Password Confirmation not match"
    );
  });
  it("it should return 200 status code -> password reseted", async () => {
    const response = await request(app).post("/api/users/reset/password").send({
      accountId: account1_id,
      token,
      password: "Password14!",
      password2: "Password14!",
    });

    expect(response.status).toBe(200);
  });
});

describe("POST /api/login route -> login process", () => {
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "cunialsourcecodes@gmail.com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/login").send(user);
    console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return a 200 status code -> get logged in account", async () => {
    const response = await request(app)
      .get("/api/account")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    console.log(response.body);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});
