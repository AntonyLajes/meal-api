import fastify from "fastify";
import { mealRoutes } from "./routes/meal";
import cookies from "@fastify/cookie"

const app = fastify()

app.register(cookies)

app.register(mealRoutes, {
    prefix: 'meal'
})

app.listen({
    port: 3333
}).then(() => {
    console.log("HTTP server running!")
})