import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";

export async function mealRoutes(app: FastifyInstance){

    const requestParamsSchema = z.object({
        id: z.string().uuid()
    })

    const countMealsInDietSequency = (meals: boolean[]) => {
        let maxSequency = 0
        let sequency = 0
        for(const in_diet of meals){
            if(in_diet){
                sequency++
            }else{
                maxSequency =  sequency > maxSequency ? sequency : maxSequency
                sequency = 0
            }
        }

        maxSequency = sequency > maxSequency ? sequency : maxSequency

        return maxSequency
    }

    app.addHook('preHandler', async (request, reply) => {

        const { method } = request

        const sessionId = request.cookies.sessionId
        if(!sessionId && method !== "POST") return reply.status(401).send()
    })
    
    app.post('/', async (request, reply) => {
        
        const requestBodyParamsSchema = z.object({
            name: z.string(),
            description: z.string(),
            in_diet: z.boolean()
        })

        const { name, description, in_diet } = requestBodyParamsSchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if(!sessionId){
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 // 1 hour
            })
        }

        await knex('meals').insert({
            id: randomUUID(),
            name,
            description,
            in_diet,
            session_id: sessionId
        })

        return reply.status(201).send()

    })

    app.get('/', async (request, reply) => {

        const sessionId = request.cookies.sessionId

        const meals = await knex('meals').where('session_id', sessionId).select('*')

        return reply.send(meals)

    })

    app.get('/:id', async (request, reply) => {

        const sessionId = request.cookies.sessionId

        const { id } = requestParamsSchema.parse(request.params)

        const meals = await knex('meals').where({'id': id, 'session_id': sessionId}).select('*')

        return reply.send(meals)
    })
    
    app.put('/:id', async (request, reply) => {

        const sessionId = request.cookies.sessionId

        const requestBodyParamsSchema = z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            in_diet: z.boolean().optional()
        })

        const { id } = requestParamsSchema.parse(request.params)
        const { name, in_diet, description } = requestBodyParamsSchema.parse(request.body)

        const meal = await knex('meals').where("id", id).first()

        await knex("meals").where({"id": id, "session_id": sessionId}).update({
            ...meal,
            name: name ?? meal?.name,
            description: description ?? meal?.description,
            in_diet: in_diet ?? meal?.in_diet,
            updated_at: knex.fn.now()
        })

        return reply.send()
    })

    app.delete('/:id', async (request, reply) => {

        const { id } = requestParamsSchema.parse(request.params)

        const sessionId = request.cookies.sessionId

        await knex('meals').where({"id": id, "session_id": sessionId}).del()

        return reply.send()

    })

    app.get('/summary', async (request, reply) => {

        const sessionId = request.cookies.sessionId

        const meals = await knex('meals')
            .where('session_id', sessionId)
            .count('id as count')
            .first()

        const mealsInDiet = await knex('meals')
        .where({
            'session_id': sessionId,
            'in_diet': true
        })
        .count('id as count')
        .first()

        const mealsOutDiet = await knex('meals')
        .where({
            'session_id': sessionId,
            'in_diet': false
        })
        .count('id as count')
        .first()

        const mealsToCount = await knex('meals')
            .where('session_id', sessionId)
            .select('in_diet')

        const sequenceInDiet = countMealsInDietSequency(mealsToCount.map(meal => meal.in_diet))

        return reply.send({
            meals,
            mealsInDiet,
            mealsOutDiet,
            sequenceInDiet
        })

    })
}