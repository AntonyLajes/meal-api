import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('meals', (table) => {
        table.dropColumn('upsert_at')
        table.timestamps(true, true)
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('meals', (table) => {
        table.dropColumn("created_at");
        table.dropColumn("updated_at");
        table.timestamp('upsert_at').defaultTo(knex.fn.now())
    })
}

