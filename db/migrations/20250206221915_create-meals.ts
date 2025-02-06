import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary().notNullable();
    table.string("name").notNullable();
    table.string("description");
    table.boolean("is_diet").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();

    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
