import { execSync } from "node:child_process";
import crypto from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";

describe("Users routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a new user", async () => {
    await request(app.server)
      .post("/users")
      .send({
        id: crypto.randomUUID(),
        username: "nickcarva",
      })
      .expect(201);
  });

  it("should not be able to create a new user when already exists username", async () => {
    await request(app.server).post("/users").send({
      id: crypto.randomUUID(),
      username: "nickcarva",
    });

    await request(app.server)
      .post("/users")
      .send({
        id: crypto.randomUUID(),
        username: "nickcarva",
      })
      .expect(409);
  });
});
