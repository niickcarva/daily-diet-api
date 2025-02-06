import { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { z } from "zod";

import { knex } from "../database";
import { checkUserIdExists } from "../middlewares/check-user-id-exists";

export async function mealsRoutes(app: FastifyInstance) {
  app.post("", { preHandler: [checkUserIdExists] }, async (request, reply) => {
    const createMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      is_diet: z.boolean(),
    });

    const { name, description, is_diet } = createMealSchema.parse(request.body);

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
