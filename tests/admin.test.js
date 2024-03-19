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

describe("POST /api/account/admin route -> parameter validations", () => {
  it("it should return 400 status code -> password must be a string", async () => {
    const user = {
      password: 1234,
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must be a string");
  });
  it("it should return 400 status code -> password is missing", async () => {
    const user = {
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password is missing");
  });
  it("it should return 400 status code -> password must be at least 8 characters long", async () => {
    const user = {
      password: "1234",
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "Password must be at least 8 characters long"
    );
  });
  it("it should return 400 status code -> password must have one capital letter", async () => {
    const user = {
      password: "password",
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must have one capital letter");
  });
  it("it should return 400 status code -> password must have one number", async () => {
    const user = {
      password: "Password",
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must have one number");
  });
  it("it should return 400 status code -> password must have one symbol", async () => {
    const user = {
      password: "Password14",
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must have one symbol");
  });
  it("it should return 400 status code -> password must have one small letter", async () => {
    const user = {
      password: "PASSWORD14!",
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must have one small letter");
  });
  it("it should return 400 status code -> email parameter is missing", async () => {
    const user = {};

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email is missing");
  });
  it("it should return 400 status code -> email must be a string", async () => {
    const user = {
      email: 1234,
      password: "Password14!",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email must be a string");
  });
  it("it should return 400 status code -> email does not have a @", async () => {
    const user = {
      email: "user1email.com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format is not valid");
  });
  it("it should return 400 status code -> email format is not valid", async () => {
    const user = {
      email: "user1@emailcom",
      password: "Password14!",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format is not valid");
  });
  it("it should return 400 status code -> email second part has a symbol", async () => {
    const user = {
      email: "user1@email.#com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format not valid");
  });
  it("it should return 400 status code -> email second part has a number", async () => {
    const user = {
      email: "user1@email.1com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format not valid");
  });
  it("it should return a 400 status code -> password confirmation parameter is missing", async () => {
    const user = {
      email: "user1@email.com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password Confirmation is missing");
  });
  it("it should return a 400 status code -> password and password confirmation not match", async () => {
    const user = {
      email: "user1@email.com",
      password: "Password14!",
      password2: "Password14@",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "Password and Password Confirmation not match"
    );
  });
});

let account1_id;

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
}); */

describe("POST /api/account/admin route -> check if email exists", () => {
  it("it should return a 400 status code -> email exists", async () => {
    const user = {
      email: "user1@fakeapis.io",
      password: "Password14!",
      password2: "Password14!",
    };

    const response = await request(app).post("/api/account/admin").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      `Email "user1@fakeapis.io" exists! Try with another one!`
    );
  });
});
