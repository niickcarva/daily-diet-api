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
  app.get("/", { preHandler: [checkUserIdExists] }, async (request) => {
    const { userId } = request.cookies;
    const meals = await knex("meals").select("*").where({ user_id: userId });
    return { meals };
  });

  app.put(
    "/:id",
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const { userId } = request.cookies;
      const mealId = (request.params as { id: string }).id;

      const existingMeal = await knex("meals")
        .select("*")
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
    }
  );

  app.post("", { preHandler: [checkUserIdExists] }, async (request) => {
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
}
