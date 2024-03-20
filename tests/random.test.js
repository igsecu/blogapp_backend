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
    /*  await Blog.sync({ force: true });
    await Comment.sync({ force: true });
    await Like.sync({ force: true });
    await Notification.sync({ force: true });
    await Post.sync({ force: true });
    await BlogAccount.sync({ force: true });
    await Token.sync({ force: true }); */
  } catch (error) {
    console.log(error.message);
  }
}, 30000);

afterAll((done) => {
  db.close();
  done();
});

let cookie;

/* describe("POST /api/account route -> create new user", () => {
  for (let x = 1; x <= 20; x++) {
    it("it should return 201 status code -> create new account successfully", async () => {
      const user = {
        email: `user${x}@fakeapis.io`,
        password: "F4k3ap1s.io",
        password2: "F4k3ap1s.io",
      };

      const response = await request(app).post("/api/account").send(user);

      expect(response.status).toBe(201);
      expect(response.body.msg).toBe("Account created successfully!");
    });
  }
});

describe("POST /blog route -> create new blog", () => {
  for (let x = 1; x <= 50; x++) {
    const number = Math.floor(Math.random() * (20 - 1) + 1);

    it("it should return a 200 status code -> user logged in", async () => {
      const user = {
        email: `user${number}@fakeapis.io`,
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
          name: `Blog ${x}`,
        })
        .set("Cookie", cookie);

      expect(response.status).toBe(201);
    });
    it("it should return a 200 status code -> logout process", async () => {
      const response = await request(app)
        .get("/api/logout")
        .set("Cookie", cookie);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You successfully logged out!");
    });
  }
});



describe("POST /post route -> create new post", () => {
  for (let x = 1; x <= 1000; x++) {
    const number = Math.floor(Math.random() * (20 - 1) + 1);

    const position = Math.floor(Math.random() * 50);

    it("it should return 200 status code -> user logged in", async () => {
      const user = {
        email: `user${number}@fakeapis.io`,
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
          title: `Post ${x}`,
          text: `Text of Post ${x}`,
          blogId: blogs[position].id,
        });
      expect(response.status).toBe(201);
    });
    it("it should return a 200 status code -> logout process", async () => {
      const response = await request(app)
        .get("/api/logout")
        .set("Cookie", cookie);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You successfully logged out!");
    });
  }
}); */

let blogs;

describe("GET /blogs route -> get all blogs", () => {
  it("it should return 200 status code", async () => {
    const response = await request(app).get("/api/blogs");
    expect(response.status).toBe(200);
    blogs = response.body.data;
  });
});

let posts;

describe("GET /posts route -> get all posts", () => {
  it("it should return 200 status code", async () => {
    const response = await request(app).get("/api/posts");
    expect(response.status).toBe(200);
    posts = response.body.data;
    console.log(posts);
  });
});

let accounts;

describe("GET /posts route -> get all accounts", () => {
  it("it should return 200 status code", async () => {
    const response = await request(app).get("/api/accounts");
    expect(response.status).toBe(200);
    accounts = response.body.data;
    console.log(accounts);
  });
});

/* describe("POST /like/post/:id route -> create new like", () => {
  for (let x = 0; x < 999; x++) {
    const number = Math.floor(Math.random() * (20 - 1) + 1);

    it("it should return 200 status code -> user logged in", async () => {
      const user = {
        email: `user${number}@fakeapis.io`,
        password: "F4k3ap1s.io",
      };

      const response = await request(app).post("/api/login").send(user);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You logged in successfully");
      cookie = response.headers["set-cookie"];
    });
    it("it should return 201 status code -> like created", async () => {
      const position = Math.floor(Math.random() * 50);

      const response = await request(app)
        .post(`/api/like/post/${posts[position].id}`)
        .set("Cookie", cookie);
      expect(response.status).toBe(201);
    });
    it("it should return a 200 status code -> logout process", async () => {
      const response = await request(app)
        .get("/api/logout")
        .set("Cookie", cookie);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You successfully logged out!");
    });
  }
}); */

/* describe("POST /comment route -> create new comment", () => {
  for (let x = 2; x <= 500; x++) {
    const number = Math.floor(Math.random() * (20 - 1) + 1);

    it("it should return 200 status code -> user logged in", async () => {
      const user = {
        email: `user${number}@fakeapis.io`,
        password: "F4k3ap1s.io",
      };

      const response = await request(app).post("/api/login").send(user);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You logged in successfully");
      cookie = response.headers["set-cookie"];
    });
    it("it should return 201 status code -> comment created", async () => {
      const position = Math.floor(Math.random() * 50);

      const response = await request(app)
        .post(`/api/comment`)
        .send({ postId: posts[position].id, text: `Comment ${x}` })
        .set("Cookie", cookie);
      expect(response.status).toBe(201);
    });
    it("it should return a 200 status code -> logout process", async () => {
      const response = await request(app)
        .get("/api/logout")
        .set("Cookie", cookie);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You successfully logged out!");
    });
  }
});
 */

/* describe("POST /api/account/admin route -> create new user", () => {
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "admin@fakeapis.io",
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/account/admin").send(user);

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
    account1_id = response.body.data.id;
  });
});

describe("PUT /api/account/:id/banned/true -> ban account", () => {
  for (let x = 0; x < 2; x++) {
    const position = Math.floor(Math.random() * 20);

    it("it should return a 200 status code -> user logged in", async () => {
      const user = {
        email: "admin@fakeapis.io",
        password: "F4k3ap1s.io",
      };

      const response = await request(app).post("/api/login").send(user);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You logged in successfully");
      cookie = response.headers["set-cookie"];
    });
    it("it should return 200 status code -> ban account", async () => {
      const response = await request(app)
        .put(`/api/account/${accounts[position].id}/banned/true`)
        .set("Cookie", cookie);
      expect(response.status).toBe(200);
    });
    it("it should return a 200 status code -> logout process", async () => {
      const response = await request(app)
        .get("/api/logout")
        .set("Cookie", cookie);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You successfully logged out!");
    });
  }
});
 */

/* describe("PUT /api/blog/:id/banned/true -> ban blog", () => {
  for (let x = 0; x < 5; x++) {
    const position = Math.floor(Math.random() * 50);

    it("it should return a 200 status code -> user logged in", async () => {
      const user = {
        email: "admin@fakeapis.io",
        password: "F4k3ap1s.io",
      };

      const response = await request(app).post("/api/login").send(user);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You logged in successfully");
      cookie = response.headers["set-cookie"];
    });
    it("it should return 200 status code -> ban account", async () => {
      const response = await request(app)
        .put(`/api/blog/${blogs[position].id}/banned/true`)
        .set("Cookie", cookie);
      expect(response.status).toBe(200);
    });
    it("it should return a 200 status code -> logout process", async () => {
      const response = await request(app)
        .get("/api/logout")
        .set("Cookie", cookie);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You successfully logged out!");
    });
  }
}); */

/* describe("PUT /api/post/:id/banned/true -> ban post", () => {
  for (let x = 0; x < 3; x++) {
    const position = Math.floor(Math.random() * 50);

    it("it should return a 200 status code -> user logged in", async () => {
      const user = {
        email: "admin@fakeapis.io",
        password: "F4k3ap1s.io",
      };

      const response = await request(app).post("/api/login").send(user);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You logged in successfully");
      cookie = response.headers["set-cookie"];
    });
    it("it should return 200 status code -> ban account", async () => {
      const response = await request(app)
        .put(`/api/post/${posts[position].id}/banned/true`)
        .set("Cookie", cookie);
      expect(response.status).toBe(200);
    });
    it("it should return a 200 status code -> logout process", async () => {
      const response = await request(app)
        .get("/api/logout")
        .set("Cookie", cookie);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You successfully logged out!");
    });
  }
});
 */
