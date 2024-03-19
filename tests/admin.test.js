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

describe("PUT /api/account/:id/banned/true -> ban account", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/account/1/banned/true");
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
  it("it should return 401 status code -> not admin", async () => {
    const response = await request(app)
      .put("/api/account/1/banned/true")
      .set("Cookie", cookie);
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe(
      "You are not authorized! Please login with an Admin account..."
    );
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
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
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app)
      .put("/api/account/1/banned/true")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> account not found", async () => {
    const response = await request(app)
      .put("/api/account/918868db-bd92-4195-8d91-21f7f4826000/banned/true")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Account with ID: 918868db-bd92-4195-8d91-21f7f4826000 not found!"
    );
  });
  it("it should return 200 status code -> ban account", async () => {
    const response = await request(app)
      .put("/api/account/d1f51306-fce1-4c51-8072-514bf6c185ea/banned/true")
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

describe("PUT /api/account/:id/banned/false -> not ban account", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/account/1/banned/false");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
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
  it("it should return 200 status code -> not ban account", async () => {
    const response = await request(app)
      .put("/api/account/d1f51306-fce1-4c51-8072-514bf6c185ea/banned/false")
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

describe("PUT /api/blog/:id/banned/true -> ban blog", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/blog/1/banned/true");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
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
  it("it should return 200 status code -> ban blog", async () => {
    const response = await request(app)
      .put("/api/blog/272246e7-d3fe-4364-89d4-ea61d8584514/banned/true")
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

describe("PUT /api/blog/:id/banned/false -> not ban blog", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/blog/1/banned/false");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
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
  it("it should return 200 status code -> not ban blog", async () => {
    const response = await request(app)
      .put("/api/blog/272246e7-d3fe-4364-89d4-ea61d8584514/banned/false")
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

describe("PUT /api/post/:id/banned/true -> ban post", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/post/1/banned/true");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
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
  it("it should return 200 status code -> ban blog", async () => {
    const response = await request(app)
      .put("/api/post/682abaa1-2ac7-48a0-8beb-500837fe1494/banned/true")
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

describe("PUT /api/post/:id/banned/false -> not ban post", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/post/1/banned/false");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
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
  it("it should return 200 status code -> not ban post", async () => {
    const response = await request(app)
      .put("/api/post/682abaa1-2ac7-48a0-8beb-500837fe1494/banned/false")
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

describe("PUT /api/comment/:id/banned/true -> ban comment", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/comment/1/banned/true");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
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
  it("it should return 200 status code -> ban comment", async () => {
    const response = await request(app)
      .put("/api/comment/918868db-bd92-4195-8d91-21f7f4826000/banned/true")
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

describe("PUT /api/comment/:id/banned/false -> not ban comment", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/comment/1/banned/false");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
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
  it("it should return 200 status code -> not ban comment", async () => {
    const response = await request(app)
      .put("/api/comment/918868db-bd92-4195-8d91-21f7f4826000/banned/false")
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
