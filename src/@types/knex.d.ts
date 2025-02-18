import { Knex } from "knex";

declare module 'knex/types/tables' {
    export interface Tables {
        meals: {
            id: string,
            name: string,
            description: string,
            created_at: string,
            updated_at: string,
            session_id: string,
            in_diet: boolean
        }
    }
}