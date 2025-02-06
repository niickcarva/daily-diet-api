import fastify from "fastify";
import cookie from "@fastify/cookie";

export const app = fastify();

app.addHook("preHandler", async (request) => {
  console.log(`👀 [${request.method}] ${request.url}`);
});

app.register(cookie);
