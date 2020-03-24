exports.up = function(knex) {
  return knex.schema.createTable("anomaly", table => {
    table.increments("anomaly_id").primary();
    table
      .integer("device_id")
      .unsigned()
      .notNullable();
    table.string("attribute").notNullable();
    table
      .foreign("device_id")
      .references("id")
      .inTable("device")
      .onDelete("cascade");
    table.enum("type", ["spike", "threshold", "dropout"]);
    table.bigInteger("timestamp").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("anomaly");
};
