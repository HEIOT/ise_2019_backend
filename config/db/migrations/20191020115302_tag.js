exports.up = knex =>
  knex.schema.createTable("tag", table => {
    table.string("name", 30).primary();
  });

exports.down = function(knex) {
  return knex.schema.dropTable("tag");
};
