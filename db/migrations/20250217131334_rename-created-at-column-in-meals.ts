import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('meals', (table) => {
        table.renameColumn('created_at', 'upsert_at')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('meals', (table) => {
        table.renameColumn('created_at', 'created_at')
    })
}

