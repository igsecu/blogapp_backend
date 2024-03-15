const request = require("supertest");
const app = require("../index");
const db = require("../src/db");

beforeAll(async () => {
  try {
    await db.sync({});
  } catch (error) {
    console.log(error.message);
  }
}, 30000);

afterAll((done) => {
  db.close();
  done();
});

let cookie;

describe("DELETE /account/image route -> delete user image", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).delete("/api/account/image");
    expect(response.status).toBe(401);
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
  it("it should return 400 status code -> no image", async () => {
    const response = await request(app)
      .delete("/api/account/image")
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
  /*   it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "user2@fakeapis.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 200 status code -> delete image success", async () => {
    const response = await request(app)
      .delete("/api/account/image")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  }); */
});

describe("PUT /account/username route -> update user username", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/account/username");
    expect(response.status).toBe(401);
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
  it("it should return 400 status code -> username is missing", async () => {
    const response = await request(app)
      .put("/api/account/username")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Query parameter is missing!");
  });
  it("it should return 400 status code -> username is short", async () => {
    const response = await request(app)
      .put("/api/account/username?value=use")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "Username must be at least 4 characters long!"
    );
  });
  /*  it("it should return 200 status code -> username updated", async () => {
    const response = await request(app)
      .put("/api/account/username?value=user2")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  }); */
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});
