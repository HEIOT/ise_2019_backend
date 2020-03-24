exports.up = function(knex) {
  return knex.schema.createTable("state_history", table => {
    table.increments("id").primary();
    table
      .integer("device_id")
      .unsigned()
      .notNullable();
    table.integer("anomaly_id").unsigned();
    table
      .foreign("device_id")
      .references("id")
      .inTable("device")
      .onDelete("cascade");
    table
      .foreign("anomaly_id")
      .references("anomaly_id")
      .inTable("anomaly")
      .onDelete("cascade");
    table.enum("state", ["urgent", "warning", "ok", "info"]);
    table.timestamp("timestamp").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("state_history");
};
