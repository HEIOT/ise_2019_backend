exports.up = knex =>
  knex.schema.createTable("category", table => {
    table.string("name", 30).primary();
  });

exports.down = function(knex) {
  return knex.schema.dropTable("category");
};
