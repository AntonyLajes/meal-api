import fastify from "fastify";
import { mealRoutes } from "./routes/meal";
import cookies from "@fastify/cookie"
import { env } from "./env";

const app = fastify()

app.register(cookies)

app.register(mealRoutes, {
    prefix: 'meal'
})

app.listen({
    port: env.PORT,
    host: 'RENDER' in process.env ? '0.0.0.0': 'localhost'
}).then(() => {
    console.log("HTTP server running!")
})