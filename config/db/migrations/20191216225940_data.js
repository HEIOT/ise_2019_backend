exports.up = function(knex) {
  return knex.schema.createTable("device_data", table => {
    table.increments("id").primary;

    table
      .integer("device_id")
      .unsigned()
      .notNullable();

    table.datetime("date");

    table
      .foreign("device_id")
      .references("id")
      .inTable("device")
      .onDelete("cascade");

    table.unique(["device_id", "date"]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("device_data");
};
