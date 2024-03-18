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

let account, cookie;

describe("POST /api/account route -> create new user", () => {
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "tibulldog14@gmail.com",
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/account").send(user);
    console.log(response.body);
    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
    account = response.body.data.id;
  });
});

describe("GET /api/account/:id/verify -> verify account", () => {
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app).get("/api/account/1/verify");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> id invalid format", async () => {
    const response = await request(app).get(
      "/api/account/d7d6829e-06ec-4e9e-b16d-cab08ba34141/verify"
    );
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Account with ID: d7d6829e-06ec-4e9e-b16d-cab08ba34141 not found!"
    );
  });
  it("it should return 200 status code -> verify account success", async () => {
    const response = await request(app).get(`/api/account/${account}/verify`);
    expect(response.status).toBe(200);
  });
});

describe("DELETE /account route -> delete account", () => {
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "tibulldog14@gmail.com",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 200 status code -> account deleted", async () => {
    const response = await request(app)
      .delete("/api/account")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
});
