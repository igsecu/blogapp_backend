const request = require("supertest");
const app = require("../index");
const db = require("../src/db");

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

describe("POST /api/account route -> create new user", () => {
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "user1@fakeapis.io",
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/account").send(user);

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
    account1_id = response.body.data.id;
  });
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "user2@fakeapis.io",
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/account").send(user);

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
    account2_id = response.body.data.id;
  });
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "user3@fakeapis.io",
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/account").send(user);

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
    account3_id = response.body.data.id;
  });
});

let blog1_id;

describe("POST /blog route -> create new blog", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/blog");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "user1@fakeapis.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 201 status code -> blog created", async () => {
    const response = await request(app)
      .post("/api/blog")
      .send({
        name: "Blog 1",
      })
      .set("Cookie", cookie);

    expect(response.status).toBe(201);
    blog1_id = response.body.data.id;
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

let post1_id;

describe("POST /post route -> create new post", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/post");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return 200 status code -> user logged in", async () => {
    const user = {
      email: "user1@fakeapis.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 201 status code -> post created", async () => {
    const response = await request(app)
      .post("/api/post")
      .set("Cookie", cookie)
      .send({
        title: "New Title",
        text: "Text",
        blogId: blog1_id,
      });
    expect(response.status).toBe(201);
    post1_id = response.body.data.id;
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("POST /comment route -> create new comment", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/comment");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return 200 status code -> user logged in", async () => {
    const user = {
      email: "user1@fakeapis.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 400 status code -> postId is missing", async () => {
    const response = await request(app)
      .post("/api/comment")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("postId is missing");
  });
  it("it should return 400 status code -> postId invalid format", async () => {
    const response = await request(app)
      .post("/api/comment")
      .set("Cookie", cookie)
      .send({ postId: 1 });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("postId: 1 - Invalid format!");
  });
  it("it should return 404 status code -> post not found", async () => {
    const response = await request(app)
      .post("/api/comment")
      .set("Cookie", cookie)
      .send({ postId: "e3badb1d-cdd9-4b08-8371-8bd78fba49a6" });
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Post with ID: e3badb1d-cdd9-4b08-8371-8bd78fba49a6 not found!"
    );
  });
  it("it should return 400 status code -> text is missing", async () => {
    const response = await request(app)
      .post("/api/comment")
      .set("Cookie", cookie)
      .send({ postId: post1_id });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Text is missing");
  });
  it("it should return 201 status code -> comment created", async () => {
    const response = await request(app)
      .post("/api/comment")
      .set("Cookie", cookie)
      .send({ postId: post1_id, text: "Comment 1" });
    expect(response.status).toBe(201);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
  it("it should return 200 status code -> user logged in", async () => {
    const user = {
      email: "user2@fakeapis.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 201 status code -> comment created", async () => {
    const response = await request(app)
      .post("/api/comment")
      .set("Cookie", cookie)
      .send({ postId: post1_id, text: "Comment 2" });
    expect(response.status).toBe(201);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("POST /like route -> create new like", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/like/post/1");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return 200 status code -> user logged in", async () => {
    const user = {
      email: "user1@fakeapis.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 400 status code -> post invalid format", async () => {
    const response = await request(app)
      .post("/api/like/post/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> post not found", async () => {
    const response = await request(app)
      .post("/api/like/post/f7cbe35a-15f3-450a-9a33-c522b7ac8535")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Post with ID: f7cbe35a-15f3-450a-9a33-c522b7ac8535 not found!"
    );
  });
  it("it should return 201 status code -> like created", async () => {
    const response = await request(app)
      .post(`/api/like/post/${post1_id}`)
      .set("Cookie", cookie);
    expect(response.status).toBe(201);
  });
  it("it should return 400 status code -> like twice", async () => {
    const response = await request(app)
      .post(`/api/like/post/${post1_id}`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
  it("it should return 200 status code -> user logged in", async () => {
    const user = {
      email: "user2@fakeapis.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 201 status code -> like created", async () => {
    const response = await request(app)
      .post(`/api/like/post/${post1_id}`)
      .set("Cookie", cookie);
    console.log(response.body);
    expect(response.status).toBe(201);
  });
  it("it should return 400 status code -> like twice", async () => {
    const response = await request(app)
      .post(`/api/like/post/${post1_id}`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});
