exports.up = knex =>
  knex.schema.createTable("master_data", table => {
    table
      .integer("device_id")
      .unsigned()
      .notNullable();
    table.string("value", 30);
    table.string("category_id", 30).notNullable();
    table
      .foreign("category_id")
      .references("name")
      .inTable("category")
      .onDelete("cascade")
      .onUpdate("cascade");
    table
      .foreign("device_id")
      .references("id")
      .inTable("device")
      .onDelete("cascade");
    table.primary(["device_id", "category_id"]);
  });

exports.down = function(knex) {
  return knex.schema.dropTable("master_data");
};
