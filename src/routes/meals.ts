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

  app.get("/diet-metrics", async (request, reply) => {
    const { userId } = request.cookies;

    const countOnDiet = await knex("meals")
      .count("id", { as: "count" })
      .where({ user_id: userId, is_diet: true })
      .first();

    const countOffDiet = await knex("meals")
      .count("id", { as: "count" })
      .where({ user_id: userId, is_diet: false })
      .first();

    const allMeals = await knex("meals")
      .select("*")
      .where({ user_id: userId })
      .orderBy("created_at", "desc");

    const { bestDietSequence } = allMeals.reduce(
      (acc, meal) => {
        if (!meal.is_diet) {
          acc.currentSequence = 0;
        } else {
          acc.currentSequence++;
        }

        if (acc.currentSequence > acc.bestDietSequence) {
          acc.bestDietSequence = acc.currentSequence;
        }

        return acc;
      },
      { bestDietSequence: 0, currentSequence: 0 }
    );

    return {
      count: allMeals.length,
      countOnDiet: countOnDiet!.count,
      countOffDiet: countOffDiet!.count,
      bestDietSequence,
    };
  });

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
