exports.up = async knex => {
  return knex.schema.createTable("device", table => {
    table.increments("id").primary();
    table.string("name", 30); //run "sudo docker volume rm isebackend_dbdata" to delete db
    table.string("device_id", 30);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("device");
};
