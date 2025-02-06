import { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { z } from "zod";
import { knex } from "../database";

export async function usersRoutes(app: FastifyInstance) {
  app.post("", async (request, reply) => {
    const createUserSchema = z.object({
      username: z.string(),
    });

    const { username } = createUserSchema.parse(request.body);

    const alreadyExistsUser = await knex("users")
      .select("id")
      .where({
        username,
      })
      .first();

    if (alreadyExistsUser?.id) {
      return reply.status(409).send({ error: "User already exists" });
    }

    const createdUser = (
      await knex("users")
        .insert({
          id: crypto.randomUUID(),
          username,
        })
        .returning("id")
    )[0];

    if (!createdUser?.id) {
      return reply.status(500).send({ error: "Failed to create user" });
    }

    reply.cookie("userId", createdUser.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    reply.status(201).send();
  });
}
