const request = require("supertest");
const app = require("../index");
const db = require("../src/db");

const Blog = require("../src/models/Blog");

beforeAll(async () => {
  try {
    await db.sync({});
    await Blog.sync({ force: true });
  } catch (error) {
    console.log(error.message);
  }
}, 30000);

afterAll((done) => {
  db.close();
  done();
});

let cookie;
let blog1_id, blog2_id;

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
  it("it should return 400 status code -> name is missing", async () => {
    const response = await request(app)
      .post("/api/blog")
      .send({})
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Name is missing");
  });
  it("it should return 400 status code -> name must be a string", async () => {
    const response = await request(app)
      .post("/api/blog")
      .send({
        name: 1234,
      })
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Name must be a string");
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
  it("it should return 400 status code -> blog name exists", async () => {
    const response = await request(app)
      .post("/api/blog")
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
    const response = await request(app).post("/api/blog");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "user3@fakeapis.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 400 status code -> name is missing", async () => {
    const response = await request(app)
      .post("/api/blog")
      .send({})
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Name is missing");
  });
  it("it should return 400 status code -> name must be a string", async () => {
    const response = await request(app)
      .post("/api/blog")
      .send({
        name: 1234,
      })
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Name must be a string");
  });
  it("it should return 201 status code -> blog created", async () => {
    const response = await request(app)
      .post("/api/blog")
      .send({
        name: "Blog 2",
      })
      .set("Cookie", cookie);

    expect(response.status).toBe(201);
    blog2_id = response.body.data.id;
  });
  it("it should return 400 status code -> blog name exists", async () => {
    const response = await request(app)
      .post("/api/blog")
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
    const response = await request(app).put("/api/blog/1");
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
      .put("/api/blog/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> blog not found", async () => {
    const response = await request(app)
      .put("/api/blog/dd7bc3e0-f9a9-4554-bd3c-d229629f8d2e")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Blog with ID: dd7bc3e0-f9a9-4554-bd3c-d229629f8d2e not found!"
    );
  });
  it("it should return 400 status code -> blog not yours", async () => {
    const response = await request(app)
      .put(`/api/blog/${blog2_id}`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "You can not update a blog that is not yours!"
    );
  });
  it("it should return 400 status code -> name exists", async () => {
    const response = await request(app)
      .put(`/api/blog/${blog1_id}`)
      .send({ name: "blog 2" })
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "Blog with name: blog 2 exists! Try with another one..."
    );
  });
  it("it should return 200 status code -> blog updated", async () => {
    const response = await request(app)
      .put(`/api/blog/${blog1_id}`)
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

describe("DELETE /blog/:id route -> delete blog", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).delete("/api/blog/1");
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
      .delete("/api/blog/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> blog not found", async () => {
    const response = await request(app)
      .delete("/api/blog/12d22c96-aa7b-42ff-a67f-5d34f2683225")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Blog with ID: 12d22c96-aa7b-42ff-a67f-5d34f2683225 not found!"
    );
  });
  it("it should return 400 status code -> blog not yours", async () => {
    const response = await request(app)
      .delete(`/api/blog/${blog2_id}`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "You can not delete a blog that is not yours!"
    );
  });
  it("it should return 200 status code -> blog deleted", async () => {
    const response = await request(app)
      .delete(`/api/blog/${blog1_id}`)
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
