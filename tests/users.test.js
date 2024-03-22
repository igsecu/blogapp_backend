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

let account1_id, account2_id, account3_id;

describe("POST /api/users/account route -> create new user", () => {
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "user1@fakeapis.io",
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/users/account").send(user);

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

    const response = await request(app).post("/api/users/account").send(user);

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

    const response = await request(app).post("/api/users/account").send(user);

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
    account3_id = response.body.data.id;
  });
});

describe("GET /api/users/account/:id/verify -> verify account", () => {
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app).get("/api/users/account/1/verify");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> id invalid format", async () => {
    const response = await request(app).get(
      "/api/users/account/d7d6829e-06ec-4e9e-b16d-cab08ba34141/verify"
    );
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Account with ID: d7d6829e-06ec-4e9e-b16d-cab08ba34141 not found!"
    );
  });
  it("it should return 200 status code -> verify account success", async () => {
    const response = await request(app).get(
      `/api/users/account/${account1_id}/verify`
    );
    expect(response.status).toBe(200);
  });
  it("it should return 200 status code -> verify account success", async () => {
    const response = await request(app).get(
      `/api/users/account/${account2_id}/verify`
    );
    expect(response.status).toBe(200);
  });
});

let blog1_id, blog2_id;

describe("POST /blog route -> create new blog", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/users/blog");
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
  it("it should return 400 status code -> name is missing", async () => {
    const response = await request(app)
      .post("/api/users/blog")
      .send({})
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Name is missing");
  });
  it("it should return 400 status code -> name must be a string", async () => {
    const response = await request(app)
      .post("/api/users/blog")
      .send({
        name: 1234,
      })
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Name must be a string");
  });
  it("it should return 201 status code -> blog created", async () => {
    const response = await request(app)
      .post("/api/users/blog")
      .send({
        name: "Blog 1",
      })
      .set("Cookie", cookie);

    expect(response.status).toBe(201);
    blog1_id = response.body.data.id;
  });
  it("it should return 400 status code -> blog name exists", async () => {
    const response = await request(app)
      .post("/api/users/blog")
      .send({
        name: "blog 1",
      })
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

describe("POST /blog route -> create new blog", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/users/blog");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "user2@fakeapis.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 400 status code -> name is missing", async () => {
    const response = await request(app)
      .post("/api/users/blog")
      .send({})
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Name is missing");
  });
  it("it should return 400 status code -> name must be a string", async () => {
    const response = await request(app)
      .post("/api/users/blog")
      .send({
        name: 1234,
      })
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Name must be a string");
  });
  it("it should return 201 status code -> blog created", async () => {
    const response = await request(app)
      .post("/api/users/blog")
      .send({
        name: "Blog 2",
      })
      .set("Cookie", cookie);

    expect(response.status).toBe(201);
    blog2_id = response.body.data.id;
  });
  it("it should return 400 status code -> blog name exists", async () => {
    const response = await request(app)
      .post("/api/users/blog")
      .send({
        name: "blog 1",
      })
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

describe("PUT /blog/:id route -> update blog", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/users/blog/1");
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
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app)
      .put("/api/users/blog/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> blog not found", async () => {
    const response = await request(app)
      .put("/api/users/blog/dd7bc3e0-f9a9-4554-bd3c-d229629f8d2e")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Blog with ID: dd7bc3e0-f9a9-4554-bd3c-d229629f8d2e not found!"
    );
  });
  it("it should return 400 status code -> blog not yours", async () => {
    const response = await request(app)
      .put(`/api/users/blog/${blog2_id}`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "You can not update a blog that is not yours!"
    );
  });
  it("it should return 400 status code -> name exists", async () => {
    const response = await request(app)
      .put(`/api/users/blog/${blog1_id}`)
      .send({ name: "blog 2" })
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "Blog with name: blog 2 exists! Try with another one..."
    );
  });
  it("it should return 200 status code -> blog updated", async () => {
    const response = await request(app)
      .put(`/api/users/blog/${blog1_id}`)
      .send({ name: "New Name" })
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
});

/* describe("DELETE /blog/:id route -> delete blog", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).delete("/api/users/blog/1");
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
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app)
      .delete("/api/users/blog/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> blog not found", async () => {
    const response = await request(app)
      .delete("/api/users/blog/12d22c96-aa7b-42ff-a67f-5d34f2683225")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Blog with ID: 12d22c96-aa7b-42ff-a67f-5d34f2683225 not found!"
    );
  });
  it("it should return 400 status code -> blog not yours", async () => {
    const response = await request(app)
      .delete(`/api/users/blog/${blog2_id}`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "You can not delete a blog that is not yours!"
    );
  });
  it("it should return 200 status code -> blog deleted", async () => {
    const response = await request(app)
      .delete(`/api/users/blog/${blog1_id}`)
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
}); */

let post1_id, post2_id;

describe("POST /post route -> create new post", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/users/post");
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
  it("it should return 400 status code -> title is missing", async () => {
    const response = await request(app)
      .post("/api/users/post")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Title is missing");
  });
  it("it should return 400 status code -> text is missing", async () => {
    const response = await request(app)
      .post("/api/users/post")
      .set("Cookie", cookie)
      .send({ title: "New Title" });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Text is missing");
  });
  it("it should return 400 status code -> blogId is missing", async () => {
    const response = await request(app)
      .post("/api/users/post")
      .set("Cookie", cookie)
      .send({ title: "New Title", text: "Text" });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("blogId is missing");
  });
  it("it should return 400 status code -> blogId invalid format", async () => {
    const response = await request(app)
      .post("/api/users/post")
      .set("Cookie", cookie)
      .send({ title: "New Title", text: "Text", blogId: 1 });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("blogId: 1 - Invalid format!");
  });
  it("it should return 404 status code -> blog not found", async () => {
    const response = await request(app)
      .post("/api/users/post")
      .set("Cookie", cookie)
      .send({
        title: "New Title",
        text: "Text",
        blogId: "95392490-b0dc-41dd-8001-aac16b329cec",
      });
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Blog with ID: 95392490-b0dc-41dd-8001-aac16b329cec not found!"
    );
  });
  it("it should return 400 status code -> blog not yours", async () => {
    const response = await request(app)
      .post("/api/users/post")
      .set("Cookie", cookie)
      .send({
        title: "New Title",
        text: "Text",
        blogId: blog2_id,
      });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "This blog is not yours! You can not create a new post..."
    );
  });
  it("it should return 201 status code -> post created", async () => {
    const response = await request(app)
      .post("/api/users/post")
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

describe("POST /post route -> create new post", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/users/post");
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
  it("it should return 400 status code -> file not valid size", async () => {
    const response = await request(app)
      .post("/api/users/post")
      .set("Cookie", cookie)
      .field("title", "New post with image")
      .field("text", "New Post text with image")
      .field("blogId", blog1_id)
      .attach("image", `${__dirname}/files/heavyimage.jpg`);
    expect(response.status).toBe(400);
  });
  /* it("it should return 201 status code -> post created", async () => {
    const response = await request(app)
      .post("/api/users/post")
      .set("Cookie", cookie)
      .field("title", "New post with image")
      .field("text", "New Post text with image")
      .field("blogId", blog1_id)
      .attach("image", `${__dirname}/files/post1.png`);
    expect(response.status).toBe(201);
  }); */
  it("it should return 400 status code -> file not valid type", async () => {
    const response = await request(app)
      .post("/api/users/post")
      .set("Cookie", cookie)
      .field("title", "New post with image")
      .field("text", "New Post text with image")
      .field("blogId", blog1_id)
      .attach("image", `${__dirname}/files/file.txt`);
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

describe("PUT /post/:id/image route -> update post image", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/users/post/1/image");
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
  it("it should return 400 status code -> image file is missing", async () => {
    const response = await request(app)
      .put(`/api/users/post/${post1_id}/image`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Image file is missing!");
  });
  it("it should return 200 status code -> image updated", async () => {
    const response = await request(app)
      .put(`/api/users/post/${post1_id}/image`)
      .set("Cookie", cookie)
      .attach("image", `${__dirname}/files/post1.png`);
    expect(response.status).toBe(200);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("PUT /post/:id route -> update post", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/users/post/1");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
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
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app)
      .put("/api/users/post/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> post not found", async () => {
    const response = await request(app)
      .put("/api/users/post/eda7fc46-a190-4360-8037-cf7d157dad3a")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Post with ID: eda7fc46-a190-4360-8037-cf7d157dad3a not found!"
    );
  });
  it("it should return 400 status code -> post not yours", async () => {
    const response = await request(app)
      .put(`/api/users/post/${post1_id}`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "You can not update a post that is not yours!"
    );
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
      email: "user1@fakeapis.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 200 status code -> post updated", async () => {
    const response = await request(app)
      .put(
        `/api/users/post/${post1_id}?title=Title from route&text=Text from route`
      )
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return 400 status code -> query parameter is missing", async () => {
    const response = await request(app)
      .put(`/api/users/post/${post1_id}`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Query parameter is missing");
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

/* describe("DELETE /post/:id/image route -> delete post image", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).delete("/api/users/post/1/image");
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
  it("it should return 400 status code -> no image", async () => {
    const response = await request(app)
      .delete(`/api/users/post/${post1_id}/image`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "The post does not have an image to delete!"
    );
  });
  it("it should return 200 status code -> image deleted", async () => {
    const response = await request(app)
      .delete(`/api/users/post/${post1_id}/image`)
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
}); */

/* describe("DELETE /post/:id route -> delete post", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).delete("/api/users/post/1");
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
  it("it should return 200 status code -> post deleted", async () => {
    const response = await request(app)
      .delete(`/api/users/post/${post1_id}`)
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
}); */

/* describe("DELETE /blog/:id route -> delete blog", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).delete("/api/users/blog/1");
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
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app)
      .delete("/api/users/blog/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> blog not found", async () => {
    const response = await request(app)
      .delete("/api/users/blog/12d22c96-aa7b-42ff-a67f-5d34f2683225")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Blog with ID: 12d22c96-aa7b-42ff-a67f-5d34f2683225 not found!"
    );
  });
  it("it should return 400 status code -> blog not yours", async () => {
    const response = await request(app)
      .delete(`/api/users/blog/${blog2_id}`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "You can not delete a blog that is not yours!"
    );
  });
  it("it should return 200 status code -> blog deleted", async () => {
    const response = await request(app)
      .delete(`/api/users/blog/${blog1_id}`)
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
});
 */

describe("DELETE /account route -> delete account", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).delete("/api/users/account");
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
  it("it should return 200 status code -> account deleted", async () => {
    const response = await request(app)
      .delete("/api/users/account")
      .set("Cookie", cookie);
    console.log(response.body);
    expect(response.status).toBe(200);
  });
});
