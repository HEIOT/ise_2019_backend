exports.up = function(knex) {
  return knex.schema.createTable("device_data_value", table => {
    table
      .integer("data_id")
      .unsigned()
      .notNullable();

    table.string("name").notNullable();
    table.string("type").notNullable();
    table.float("value");

    table
      .foreign("data_id")
      .references("id")
      .inTable("device_data")
      .onDelete("cascade");

    table.primary(["data_id", "name"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("device_data_value");
};
