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
