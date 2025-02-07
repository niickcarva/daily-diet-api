import { execSync } from "node:child_process";
import crypto from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";

describe("Meals routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a new meal", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      id: crypto.randomUUID(),
      username: "nickcarva",
    });
    const cookies = createUserResponse.get("Set-Cookie")!;

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Tomato Salad",
        description: "Healthy lunch",
        is_diet: true,
      })
      .expect(201);
  });

  it("should be able to list all meals", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      id: crypto.randomUUID(),
      username: "nickcarva",
    });
    const cookies = createUserResponse.get("Set-Cookie")!;

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Tomato Salad",
      description: "Healthy lunch",
      is_diet: true,
    });

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: "Tomato Salad",
        description: "Healthy lunch",
        is_diet: 1,
      }),
    ]);
  });

  it("should be able to get a specific meal", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      id: crypto.randomUUID(),
      username: "nickcarva",
    });
    const cookies = createUserResponse.get("Set-Cookie")!;

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Tomato Salad",
      description: "Healthy lunch",
      is_diet: true,
    });

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies);

    const mealId = listMealsResponse.body.meals[0].id;

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: "Tomato Salad",
        description: "Healthy lunch",
        is_diet: 1,
      })
    );
  });

  it("should be able to update a meal", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      id: crypto.randomUUID(),
      username: "nickcarva",
    });
    const cookies = createUserResponse.get("Set-Cookie")!;

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Tomato Salad",
      description: "Healthy lunch",
      is_diet: true,
    });

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies);

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .send({
        name: "Tomato Salad Updated",
        description: "Healthy lunch",
        is_diet: true,
      })
      .expect(204);
  });

  it("should be able to delete a meal", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      id: crypto.randomUUID(),
      username: "nickcarva",
    });
    const cookies = createUserResponse.get("Set-Cookie")!;

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Tomato Salad",
      description: "Healthy lunch",
      is_diet: true,
    });

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies);

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(204);
  });

  it("should be able to get the diet metrics", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      id: crypto.randomUUID(),
      username: "nickcarva",
    });
    const cookies = createUserResponse.get("Set-Cookie")!;

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Tomato Salad",
      description: "Healthy lunch",
      is_diet: true,
    });

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Orange",
      description: "Fruit after lunch",
      is_diet: true,
    });

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Snickers",
      description: "Chocolate after lunch",
      is_diet: false,
    });

    const getMealResponse = await request(app.server)
      .get(`/meals/diet-metrics`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getMealResponse.body).toEqual(
      expect.objectContaining({
        count: 3,
        countOnDiet: 2,
        countOffDiet: 1,
        bestDietSequence: 2,
      })
    );
  });
});
