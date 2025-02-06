import { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { z } from "zod";

import { knex } from "../database";
import { checkUserIdExists } from "../middlewares/check-user-id-exists";

const createUpdateMealSchema = z.object({
  name: z.string(),
  description: z.string(),
  is_diet: z.boolean(),
});

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", checkUserIdExists);

  app.get("/", async (request) => {
    const { userId } = request.cookies;
    const meals = await knex("meals").select("*").where({ user_id: userId });
    return { meals };
  });

  app.get("/:id", async (request) => {
    const { userId } = request.cookies;
    const mealId = (request.params as { id: string }).id;

    const meal = await knex("meals")
      .select("*")
      .where({ id: mealId, user_id: userId })
      .first();
    return { meal };
  });

  app.put("/:id", async (request, reply) => {
    const { userId } = request.cookies;
    const mealId = (request.params as { id: string }).id;

    const existingMeal = await knex("meals")
      .select("id")
      .where({
        id: mealId,
        user_id: userId,
      })
      .first();
    if (!existingMeal) {
      return reply.status(404).send({ error: "Meal not found" });
    }

    const { name, description, is_diet } = createUpdateMealSchema.parse(
      request.body
    );

    await knex("meals").where("id", mealId).update({
      name,
      description,
      is_diet,
    });
  });

  app.post("", async (request) => {
    const { name, description, is_diet } = createUpdateMealSchema.parse(
      request.body
    );

    const { userId } = request.cookies;

    await knex("meals").insert({
      id: crypto.randomUUID(),
      name,
      description,
      is_diet,
      user_id: userId,
    });
  });

  app.delete("/:id", async (request, reply) => {
    const { userId } = request.cookies;
    const mealId = (request.params as { id: string }).id;

    const existingMeal = await knex("meals")
      .select("id")
      .where({
        id: mealId,
        user_id: userId,
      })
      .first();
    if (!existingMeal) {
      return reply.status(404).send({ error: "Meal not found" });
    }

    await knex("meals").delete().where({
      id: mealId,
      user_id: userId,
    });
  });
}
