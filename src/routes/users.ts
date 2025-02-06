import { FastifyInstance } from "fastify";

export async function usersRoutes(app: FastifyInstance) {
  app.get("/hello", () => {
    return "Hello World!";
  });
}
