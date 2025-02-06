import fastify from "fastify";
import cookie from "@fastify/cookie";
import { usersRoutes } from "./routes/users";
import { mealsRoutes } from "./routes/meals";

export const app = fastify();

app.addHook("preHandler", async (request) => {
  console.log(`--- ---`);
  console.log(`👀 [${request.method}] ${request.url}`);
  console.time("RequestTime");
});
app.addHook("onResponse", async () => {
  console.timeEnd("RequestTime");
});

app.register(cookie);

app.register(usersRoutes, {
  prefix: "/users",
});
app.register(mealsRoutes, {
  prefix: "/meals",
});
