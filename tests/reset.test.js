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

let token;

describe("POST /request/password route -> request password", () => {
  it("it should return 400 status code -> email is missing", async () => {
    const response = await request(app).post("/api/request/password");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email is missing");
  });
  it("it should return 404 status code -> account not exists", async () => {
    const response = await request(app)
      .post("/api/request/password")
      .send({ email: "user4@fakeapis.io" });
    expect(response.status).toBe(404);
  });
  it("it should return 200 status code -> email sent", async () => {
    const response = await request(app)
      .post("/api/request/password")
      .send({ email: "tibulldog14@gmail.com" });
    expect(response.status).toBe(200);
    token = response.body.token;
  });
});

describe("POST /reset/password route -> reset password", () => {
  it("it should return 400 status code -> account id is missing", async () => {
    const response = await request(app).post("/api/reset/password");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("accountId is missing");
  });
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app).post("/api/reset/password").send({
      accountId: 1,
    });

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("accountId: 1 - Invalid format!");
  });
  it("it should return 404 status code -> account not found", async () => {
    const response = await request(app).post("/api/reset/password").send({
      accountId: "380ae108-53b6-4cf9-b0e5-e08bb7dfa372",
    });

    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Account with ID: 380ae108-53b6-4cf9-b0e5-e08bb7dfa372 not found!"
    );
  });
  it("it should return 404 status code -> token not found", async () => {
    const response = await request(app).post("/api/reset/password").send({
      accountId: "48de47a5-2183-4a3b-9559-d0a3687f46ad",
    });

    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Token for the account: 48de47a5-2183-4a3b-9559-d0a3687f46ad not found!"
    );
  });
  it("it should return 400 status code -> invalid token", async () => {
    const response = await request(app).post("/api/reset/password").send({
      accountId: "b25c39ec-56db-47dd-8533-a8866f59f563",
      token: 1,
    });

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Invalid token!");
  });
  it("it should return 400 status code -> password not match", async () => {
    const response = await request(app).post("/api/reset/password").send({
      accountId: "b25c39ec-56db-47dd-8533-a8866f59f563",
      token,
      password: "Password14!",
      password2: "Password14",
    });

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "Password and Password Confirmation not match"
    );
  });
  it("it should return 200 status code -> password reseted", async () => {
    const response = await request(app).post("/api/reset/password").send({
      accountId: "b25c39ec-56db-47dd-8533-a8866f59f563",
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
      email: "tibulldog14@gmail.com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return a 200 status code -> get logged in account", async () => {
    const response = await request(app)
      .get("/api/account")
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
