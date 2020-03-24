exports.up = knex =>
  knex.schema.createTable("device_tag", table => {
    table
      .integer("device_id")
      .unsigned()
      .notNullable();
    table.string("tag_id", 30).notNullable();

    table
      .foreign("device_id")
      .references("id")
      .inTable("device")
      .onDelete("cascade");
    table
      .foreign("tag_id")
      .references("name")
      .inTable("tag")
      .onDelete("cascade")
      .onUpdate("cascade");
    table.primary(["device_id", "tag_id"]);
  });

exports.down = function(knex) {
  return knex.schema.dropTable("device_tag");
};
